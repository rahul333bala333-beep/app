import crypto from 'crypto';
import prisma from '../prisma';

export interface OtpRequestResult {
  success: boolean;
  otp?: string;
  error?: string;
  cooldownSeconds?: number;
  expiresAt?: Date;
}

export interface OtpVerifyResult {
  success: boolean;
  error?: string;
  destination?: string;
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOtp(): string {
  // Uses crypto.randomInt for uniform cryptographic distribution
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Hash an OTP using SHA-256 for secure database storage
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

/**
 * Compare OTP against stored SHA-256 hash using timing-safe comparison
 */
export function verifyOtpHash(otp: string, storedHash: string): boolean {
  try {
    const inputHash = hashOtp(otp);
    return crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Normalise a phone number or email destination
 */
export function normaliseDestination(destination: string, type: 'PHONE' | 'EMAIL'): string {
  if (type === 'EMAIL') {
    return destination.trim().toLowerCase();
  }
  // Remove non-digit characters except leading +
  const cleaned = destination.trim().replace(/[^\d+]/g, '');
  // Standardise Indian phone numbers
  if (cleaned.startsWith('+91')) {
    return cleaned;
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return cleaned;
}

/**
 * Request an OTP for Phone or Email with rate-limiting, resend cooldown, and expiration
 */
export async function requestOtp({
  destination,
  type,
  purpose = 'CUSTOMER_LOGIN',
}: {
  destination: string;
  type: 'PHONE' | 'EMAIL';
  purpose?: string;
}): Promise<OtpRequestResult> {
  const normDest = normaliseDestination(destination, type);

  // Validate format
  if (type === 'PHONE') {
    const digitsOnly = normDest.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normDest)) {
      return { success: false, error: 'Please enter a valid email address' };
    }
  }

  // Check resend cooldown (60 seconds)
  const recentOtp = await prisma.oTPVerification.findFirst({
    where: {
      destination: normDest,
      verified: false,
      createdAt: { gt: new Date(Date.now() - 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((Date.now() - recentOtp.createdAt.getTime()) / 1000);
    const remaining = Math.max(1, 60 - elapsedSeconds);
    return {
      success: false,
      error: `Please wait ${remaining}s before requesting a new code`,
      cooldownSeconds: remaining,
    };
  }

  // Invalidate any existing unverified OTPs for this destination
  await prisma.oTPVerification.updateMany({
    where: { destination: normDest, verified: false },
    data: { verified: true }, // Mark old ones as consumed
  });

  // Generate new 6-digit cryptographic OTP
  const otp = generateSecureOtp();
  const otpHashVal = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  // Save to database
  await prisma.oTPVerification.create({
    data: {
      destination: normDest,
      phone: type === 'PHONE' ? normDest : undefined,
      type,
      otp, // Stored for test/dev inspections
      otpHash: otpHashVal,
      purpose,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      verified: false,
    },
  });

  return {
    success: true,
    otp, // Will be dispatched via SMS / Email provider
    expiresAt,
    cooldownSeconds: 60,
  };
}

/**
 * Verify an OTP submission against database records with attempt limits and expiry
 */
export async function verifyOtpSubmission({
  destination,
  otp,
  type = 'PHONE',
}: {
  destination: string;
  otp: string;
  type?: 'PHONE' | 'EMAIL';
}): Promise<OtpVerifyResult> {
  const normDest = normaliseDestination(destination, type);
  const cleanedOtp = otp.trim();

  if (!cleanedOtp || cleanedOtp.length !== 6) {
    return { success: false, error: 'Please enter the complete 6-digit verification code' };
  }

  // Find latest active OTP record
  const record = await prisma.oTPVerification.findFirst({
    where: {
      destination: normDest,
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return {
      success: false,
      error: 'No active verification code found. Please request a new code.',
    };
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    return {
      success: false,
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  // Check attempt limit
  if (record.attempts >= record.maxAttempts) {
    return {
      success: false,
      error: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  // Verify hash or plain code (or master OTP in non-production environments)
  const isMasterOtp = process.env.NODE_ENV !== 'production' && cleanedOtp === '123456';
  let isValid = isMasterOtp;
  if (!isValid && record.otpHash) {
    isValid = verifyOtpHash(cleanedOtp, record.otpHash);
  } else if (!isValid && record.otp) {
    isValid = record.otp === cleanedOtp;
  }

  if (!isValid) {
    // Increment attempts
    const newAttempts = record.attempts + 1;
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { attempts: newAttempts },
    });

    const attemptsLeft = record.maxAttempts - newAttempts;
    return {
      success: false,
      error: `Incorrect verification code. ${attemptsLeft} attempt(s) remaining.`,
    };
  }

  // Mark OTP as consumed (single-use)
  await prisma.oTPVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return { success: true, destination: normDest };
}

