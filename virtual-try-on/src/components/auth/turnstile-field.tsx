'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileFieldProps {
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  onToken: (token: string | null) => void;
}

export function TurnstileField({ turnstileRef, onToken }: TurnstileFieldProps) {
  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        options={{ theme: 'light', size: 'flexible', refreshExpired: 'auto' }}
        onSuccess={(token) => onToken(token)}
        onExpire={() => {
          onToken(null);
          turnstileRef.current?.reset();
        }}
        onError={() => {
          onToken(null);
          turnstileRef.current?.reset();
        }}
      />
    </div>
  );
}

export function isTurnstileConfigured() {
  return Boolean(siteKey);
}
