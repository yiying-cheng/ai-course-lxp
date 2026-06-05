'use client';

import Link from 'next/link';
import { useTryOn } from '@/context/try-on-context';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const { quota, user, signOut } = useTryOn();

  return (
    <header className="sticky top-0 z-50 border-b border-[#d2d2d7]/60 bg-[#fbfbfd]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-[21px] font-semibold tracking-tight text-[#1d1d1f]">
          FitPreview
        </Link>
        <nav className="flex items-center gap-5">
          {user && (
            <Link href="/history" className="text-[15px] text-[#1d1d1f] hover:text-[#0071e3]">
              History
            </Link>
          )}
          {quota && (
            <span className="hidden text-[13px] text-[#86868b] sm:inline">
              {quota.remaining} of {quota.limit} left
              {quota.period === 'monthly' ? ' this month' : ''}
            </span>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[140px] truncate text-[13px] text-[#86868b] md:inline">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" glow={false}>
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
