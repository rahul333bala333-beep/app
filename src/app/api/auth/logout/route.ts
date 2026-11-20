import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('stayzy_session_token')?.value;

    // 1. Invalidate & remove session from database
    if (token) {
      try {
        await prisma.session.deleteMany({
          where: { sessionToken: token },
        });
      } catch (dbErr) {
        console.error('[Logout DB Session Deletion Error]', dbErr);
      }
    }

    // 2. Clear HTTP-only session cookie with full options (path, expires in past, maxAge: 0)
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Set cookie on response object to guarantee client browser drops it
    response.cookies.set('stayzy_session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    // Also delete from cookieStore
    cookieStore.delete('stayzy_session_token');

    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (err: any) {
    console.error('[Logout Route Error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
