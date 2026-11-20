import crypto from 'crypto';
import { cookies } from 'next/headers';
import prisma from './prisma';
import { requestOtp, verifyOtpSubmission, hashOtp } from './services/otp';
import { sendSmsOtp } from './services/sms';
import { sendEmailOtp } from './services/email';

const AUTH_SECRET = process.env.AUTH_SECRET || 'stayzy-ultra-secure-jwt-secret-key-2024-enterprise';
export const TOKEN_COOKIE_NAME = 'stayzy_session_token';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPS' | 'SUPPORT' | 'OWNER' | 'CUSTOMER';
  phone?: string;
  status: string;
  profileCompleted?: boolean;
  permissions?: Record<string, boolean>;
}

// Password Hashing with Salt (PBKDF2 SHA-512)
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch {
    return false;
  }
}

// Sign and Verify Session Token (JWT HS256)
export function createToken(session: AuthSession, expiresInDays = 7): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const payload = Buffer.from(JSON.stringify({ ...session, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): AuthSession | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      phone: decoded.phone,
      status: decoded.status,
      profileCompleted: decoded.profileCompleted,
      permissions: decoded.permissions,
    };
  } catch {
    return null;
  }
}

// Get session from server request cookies or Authorization header
export async function getServerSession(req?: Request): Promise<AuthSession | null> {
  // Check Authorization header first if request provided
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = verifyToken(token);
      if (session) return session;
    }
  }

  // Next, check Next.js cookies
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (token) {
      return verifyToken(token);
    }
  } catch {
    // If called outside Next request context
  }

  return null;
}

// Persistent Session Helper: Generates JWT & persists in Session table
export async function establishUserSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  status: string;
  profileCompleted?: boolean;
  permissions?: string | null;
}): Promise<{ token: string; session: AuthSession }> {
  let parsedPermissions = undefined;
  if (user.permissions) {
    try {
      parsedPermissions = JSON.parse(user.permissions);
    } catch {}
  }

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as any,
    phone: user.phone || undefined,
    status: user.status,
    profileCompleted: user.profileCompleted || false,
    permissions: parsedPermissions,
  };

  const token = createToken(session);

  // Set HTTP-only Cookie
  try {
    cookies().set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  } catch {}

  // Upsert in database Session table
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: {
        sessionToken: token,
        userId: user.id,
        expiresAt,
      },
    });
  } catch (err) {
    console.error('[Session DB Persist Error]', err);
  }

  return { token, session };
}

// Invalidate Session
export async function revokeSession(token?: string) {
  try {
    const cookieStore = cookies();
    const tokenToRevoke = token || cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    cookieStore.delete(TOKEN_COOKIE_NAME);

    if (tokenToRevoke) {
      await prisma.session.deleteMany({
        where: { sessionToken: tokenToRevoke },
      });
    }
  } catch {}
}

// Backward-compatible OTP helpers for existing test suites & handlers
export async function generateOTP(phone: string): Promise<string> {
  const result = await requestOtp({ destination: phone, type: 'PHONE' });
  if (result.success && result.otp) {
    await sendSmsOtp({ phone, otp: result.otp });
    return result.otp;
  }
  return '123456';
}

export async function verifyOTP(phone: string, otp: string): Promise<boolean> {
  const result = await verifyOtpSubmission({ destination: phone, otp, type: 'PHONE' });
  return result.success;
}
