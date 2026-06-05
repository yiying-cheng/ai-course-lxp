'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadPersona, savePersona } from '@/lib/storage';
import type {
  GarmentCategory,
  Persona,
  TryOnStep,
} from '@/lib/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface QuotaState {
  limit: number;
  used: number;
  remaining: number;
  isRegistered: boolean;
  period: 'lifetime' | 'monthly';
}

interface TryOnContextValue {
  step: TryOnStep;
  persona: Persona | null;
  garmentDataUrl: string | null;
  category: GarmentCategory;
  resultImage: string | null;
  error: string | null;
  isMock: boolean;
  isGenerating: boolean;
  user: AuthUser | null;
  quota: QuotaState | null;
  setCategory: (c: GarmentCategory) => void;
  setPersonaFromFile: (file: File) => Promise<void>;
  setGarmentFromFile: (file: File) => Promise<void>;
  generateTryOn: () => Promise<void>;
  resetForAnotherGarment: () => void;
  signOut: () => Promise<void>;
  refreshQuota: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const TryOnContext = createContext<TryOnContextValue | null>(null);

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function TryOnProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<TryOnStep>('setup');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [garmentDataUrl, setGarmentDataUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<GarmentCategory>('tops');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [quota, setQuota] = useState<QuotaState | null>(null);

  const refreshAuth = useCallback(async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user ?? null);
    }
  }, []);

  const refreshQuota = useCallback(async () => {
    const res = await fetch('/api/quota');
    if (res.ok) {
      setQuota(await res.json());
    }
  }, []);

  useEffect(() => {
    setPersona(loadPersona());
    refreshAuth();
    refreshQuota();
  }, [refreshAuth, refreshQuota]);

  const setPersonaFromFile = useCallback(async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const saved = savePersona(dataUrl);
    setPersona(saved);
    setError(null);
  }, []);

  const setGarmentFromFile = useCallback(async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    setGarmentDataUrl(dataUrl);
    setError(null);
  }, []);

  const generateTryOn = useCallback(async () => {
    if (!persona?.dataUrl || !garmentDataUrl) {
      setError('Please upload your photo and a garment image.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStep('generating');

    try {
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelImage: persona.dataUrl,
          garmentImage: garmentDataUrl,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStep('setup');
        setError(data.error ?? 'Try-on failed. Please try again.');
        await refreshQuota();
        return;
      }

      setResultImage(data.resultImage);
      setIsMock(Boolean(data.mock));
      await refreshQuota();
      setStep('result');
    } catch {
      setStep('setup');
      setError('Network error. Please check your connection and retry.');
    } finally {
      setIsGenerating(false);
    }
  }, [persona, garmentDataUrl, category, refreshQuota]);

  const resetForAnotherGarment = useCallback(() => {
    setGarmentDataUrl(null);
    setResultImage(null);
    setIsMock(false);
    setError(null);
    setStep('setup');
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    await refreshQuota();
  }, [refreshQuota]);

  const value = useMemo(
    () => ({
      step,
      persona,
      garmentDataUrl,
      category,
      resultImage,
      error,
      isMock,
      isGenerating,
      user,
      quota,
      setCategory,
      setPersonaFromFile,
      setGarmentFromFile,
      generateTryOn,
      resetForAnotherGarment,
      signOut,
      refreshQuota,
      refreshAuth,
    }),
    [
      step,
      persona,
      garmentDataUrl,
      category,
      resultImage,
      error,
      isMock,
      isGenerating,
      user,
      quota,
      setPersonaFromFile,
      setGarmentFromFile,
      generateTryOn,
      resetForAnotherGarment,
      signOut,
      refreshQuota,
      refreshAuth,
    ],
  );

  return <TryOnContext.Provider value={value}>{children}</TryOnContext.Provider>;
}

export function useTryOn() {
  const ctx = useContext(TryOnContext);
  if (!ctx) {
    throw new Error('useTryOn must be used within TryOnProvider');
  }
  return ctx;
}
