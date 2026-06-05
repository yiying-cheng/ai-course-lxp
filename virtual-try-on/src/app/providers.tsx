'use client';

import { TryOnProvider } from '@/context/try-on-context';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <TryOnProvider>{children}</TryOnProvider>;
}
