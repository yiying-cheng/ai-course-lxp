import type { GarmentCategory } from '@/lib/types';
import { TryOnServiceError } from './errors';
import { devLog } from './logger';

const DEFAULT_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
const DEFAULT_MODEL = 'doubao-seedream-5-0-260128';

interface ArkGenerationResponse {
  data?: Array<{ url?: string; size?: string }>;
  error?: { message?: string; code?: string };
}

const PROMPTS: Record<GarmentCategory, string> = {
  tops: '将图1的上装替换为图2的服装，保持人脸、姿势和背景不变',
  bottoms: '将图1的下装替换为图2的服装，保持人脸、姿势和背景不变',
  dresses: '将图1的服装替换为图2的连衣裙，保持人脸、姿势和背景不变',
};

function getConfig() {
  const apiKey = process.env.ARK_API_KEY?.trim();
  if (!apiKey) {
    throw new TryOnServiceError(
      'API_ERROR',
      'ARK_API_KEY is not configured',
      500,
    );
  }

  return {
    apiKey,
    baseUrl: process.env.ARK_API_BASE?.trim() || DEFAULT_BASE,
    model: process.env.ARK_MODEL?.trim() || DEFAULT_MODEL,
    timeoutMs: Number(process.env.TRY_ON_TIMEOUT_MS ?? 90_000),
  };
}

/** Ark accepts HTTPS URLs; data URLs from the browser are passed through as-is. */
function normalizeImageInput(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  return `data:image/jpeg;base64,${trimmed}`;
}

export async function runArkVirtualTryOn(params: {
  personImage: string;
  garmentImage: string;
  category: GarmentCategory;
  requestId: string;
}): Promise<string> {
  const { apiKey, baseUrl, model, timeoutMs } = getConfig();
  const started = Date.now();
  const endpoint = `${baseUrl}/images/generations`;

  const body = {
    model,
    prompt: PROMPTS[params.category],
    image: [
      normalizeImageInput(params.personImage),
      normalizeImageInput(params.garmentImage),
    ],
    sequential_image_generation: 'disabled',
    response_format: 'url',
    size: '2K',
    stream: false,
    watermark: false,
  };

  devLog('ark', 'request start', {
    requestId: params.requestId,
    model,
    category: params.category,
    endpoint,
  });

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      devLog('ark', 'request timeout', { requestId: params.requestId, timeoutMs });
      throw new TryOnServiceError(
        'TIMEOUT',
        `Ark request timed out after ${timeoutMs}ms`,
        504,
      );
    }
    throw err;
  }

  const durationMs = Date.now() - started;
  const rawText = await response.text();

  devLog('ark', 'response received', {
    requestId: params.requestId,
    status: response.status,
    durationMs,
    bodyPreview: rawText.slice(0, 200),
  });

  if (response.status === 401) {
    throw new TryOnServiceError(
      'API_UNAUTHORIZED',
      'Ark API returned 401 Unauthorized',
      401,
    );
  }

  if (response.status === 429) {
    throw new TryOnServiceError(
      'API_RATE_LIMIT',
      'Ark API returned 429 Too Many Requests',
      429,
    );
  }

  let parsed: ArkGenerationResponse;
  try {
    parsed = JSON.parse(rawText) as ArkGenerationResponse;
  } catch {
    throw new TryOnServiceError(
      'API_ERROR',
      `Ark API returned invalid JSON (${response.status})`,
      response.status,
    );
  }

  if (!response.ok) {
    const msg = parsed.error?.message ?? rawText.slice(0, 300);
    throw new TryOnServiceError(
      'API_ERROR',
      `Ark API error ${response.status}: ${msg}`,
      response.status,
    );
  }

  const url = parsed.data?.[0]?.url;
  if (!url) {
    throw new TryOnServiceError(
      'API_ERROR',
      'Ark API completed without an image URL',
      500,
    );
  }

  return url;
}
