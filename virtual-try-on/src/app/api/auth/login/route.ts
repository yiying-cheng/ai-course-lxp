import { NextResponse } from 'next/server';
import { loginUser } from '@/services/auth.service';
import { setSessionCookie } from '@/lib/session';
import { getRequestIp, verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      turnstileToken?: string;
    };

    const turnstile = await verifyTurnstileToken(body.turnstileToken, getRequestIp(request));
    if (!turnstile.ok) {
      return NextResponse.json({ success: false, error: turnstile.error }, { status: 400 });
    }

    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 },
      );
    }

    const user = await loginUser({
      email: body.email,
      password: body.password,
    });

    await setSessionCookie({ userId: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign in failed.';
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
