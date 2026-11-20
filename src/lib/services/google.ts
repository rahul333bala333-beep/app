/**
 * Stayzy Production Google OAuth & Identity Service
 * Handles Google Sign-In, OAuth 2.0 authorization redirects, token exchange, and cryptographic ID token verification.
 */

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

export interface GoogleAuthTokens {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  refreshToken?: string;
}

/**
 * Build the official Google OAuth 2.0 authorization URL
 */
export function getGoogleAuthUrl({
  redirectUri,
  state = 'customer_login',
}: {
  redirectUri: string;
  state?: string;
}): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'stayzy-dev-google-client-id';
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ].join(' '),
    state,
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Exchange the authorization code received from Google for tokens
 */
export async function exchangeGoogleCodeForTokens({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}): Promise<GoogleAuthTokens | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // If not configured in environment, simulate fallback in dev mode
    console.warn('[Google OAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set in environment.');
    return null;
  }

  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values).toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('[Google OAuth Token Error]', errorData);
    return null;
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    expiresIn: data.expires_in,
    refreshToken: data.refresh_token,
  };
}

/**
 * Verify a Google ID token with Google's public tokeninfo endpoint
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserProfile | null> {
  try {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('[Google Token Info Error] Invalid ID token');
      return null;
    }

    const data = await response.json();

    // Verify audience if configured
    const configuredClientId = process.env.GOOGLE_CLIENT_ID;
    if (configuredClientId && data.aud !== configuredClientId) {
      console.error('[Google Token Info Error] Audience mismatch', data.aud, configuredClientId);
      return null;
    }

    // Verify email was verified by Google
    const isEmailVerified = data.email_verified === 'true' || data.email_verified === true;
    if (!isEmailVerified) {
      console.error('[Google Token Info Error] Email is not verified with Google');
      return null;
    }

    return {
      googleId: data.sub,
      email: data.email.toLowerCase(),
      emailVerified: true,
      name: data.name || data.email.split('@')[0],
      picture: data.picture,
    };
  } catch (err) {
    console.error('[Google Token Verification Exception]', err);
    return null;
  }
}

