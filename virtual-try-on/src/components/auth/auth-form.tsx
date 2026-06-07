'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { TurnstileField, isTurnstileConfigured } from '@/components/auth/turnstile-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const turnstileRequired = isTurnstileConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'sign-up';
  const canSubmit = !turnstileRequired || Boolean(turnstileToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (turnstileRequired && !turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isSignUp
            ? { email, password, name: name || undefined, turnstileToken }
            : { email, password, turnstileToken },
        ),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong.');
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#1d1d1f]">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-[17px] text-[#86868b]">
          {isSignUp
            ? 'Get 5 free try-ons every month.'
            : 'Sign in to continue with your saved previews.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <Input
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          minLength={8}
        />

        <TurnstileField turnstileRef={turnstileRef} onToken={setTurnstileToken} />

        {error && (
          <p className="rounded-xl bg-[#fff2f2] px-4 py-3 text-sm text-[#bf4800]">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full rounded-full"
          disabled={loading || !canSubmit}
        >
          {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-8 text-center text-[15px] text-[#86868b]">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Link
          href={isSignUp ? '/sign-in' : '/sign-up'}
          className="text-[#0071e3] hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </div>
  );
}
