import type { Persona } from './types';

const PERSONA_KEY = 'vto_persona';

export const CATEGORY_LABELS = {
  tops: 'Top',
  bottoms: 'Bottom',
  dresses: 'Dress',
} as const;

export function loadPersona(): Persona | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PERSONA_KEY);
    return raw ? (JSON.parse(raw) as Persona) : null;
  } catch {
    return null;
  }
}

export function savePersona(dataUrl: string): Persona {
  const persona: Persona = { dataUrl, updatedAt: new Date().toISOString() };
  localStorage.setItem(PERSONA_KEY, JSON.stringify(persona));
  return persona;
}

export function clearPersona() {
  localStorage.removeItem(PERSONA_KEY);
}
