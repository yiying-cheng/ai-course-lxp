export type GarmentCategory = 'tops' | 'bottoms' | 'dresses';

export type TryOnStep = 'setup' | 'generating' | 'result';

export interface Persona {
  dataUrl: string;
  updatedAt: string;
}

export interface TryOnApiResponse {
  success: boolean;
  resultImage?: string;
  error?: string;
  code?: 'QUOTA_EXCEEDED' | 'API_ERROR' | 'API_UNAUTHORIZED' | 'API_RATE_LIMIT' | 'TIMEOUT' | 'MOCK';
  remaining?: number;
  mock?: boolean;
}
