const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type SiteVerifyResponse = {
  success?: boolean;
  'error-codes'?: string[];
};

export function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

function isLocalIp(ip: string) {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  );
}

function mapTurnstileError(codes: string[]) {
  if (process.env.NODE_ENV !== 'development') {
    return 'Security check failed. Please try again.';
  }

  if (codes.includes('hostname-mismatch')) {
    return 'Turnstile hostname mismatch. Add localhost to allowed hostnames in your Cloudflare Turnstile widget settings.';
  }

  if (codes.includes('invalid-input-secret')) {
    return 'Turnstile secret key is invalid. Check TURNSTILE_SECRET_KEY in .env.local.';
  }

  if (codes.includes('invalid-input-response') || codes.includes('timeout-or-duplicate')) {
    return 'Security check expired. Complete the Cloudflare check again, then submit.';
  }

  return `Security check failed (${codes.join(', ') || 'unknown'}). Please try again.`;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: 'Please complete the security check.' };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  // Sending a mismatched IP often fails verification on localhost.
  if (remoteIp && !isLocalIp(remoteIp)) {
    body.set('remoteip', remoteIp);
  }

  const res = await fetch(SITEVERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    console.error('[turnstile] siteverify HTTP error:', res.status);
    return { ok: false, error: 'Security check failed. Please try again.' };
  }

  const data = (await res.json()) as SiteVerifyResponse;

  if (!data.success) {
    const codes = data['error-codes'] ?? [];
    console.error('[turnstile] verification failed:', codes);
    return { ok: false, error: mapTurnstileError(codes) };
  }

  return { ok: true };
}

export function getRequestIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    undefined
  );
}
