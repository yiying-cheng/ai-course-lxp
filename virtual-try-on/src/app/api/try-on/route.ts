import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import type { GarmentCategory } from '@/lib/types';
import { saveTryOnRecord } from '@/services/auth.service';
import { consumeQuota, getQuota } from '@/services/quota.service';
import { runArkVirtualTryOn } from '@/services/try-on/ark-seedream.service';
import {
  TryOnServiceError,
  toClientMessage,
  toHttpStatus,
} from '@/services/try-on/errors';
import { fetchImageAsDataUrl } from '@/services/try-on/fetch-result-image';
import { devLog } from '@/services/try-on/logger';

const VALID_CATEGORIES: GarmentCategory[] = ['tops', 'bottoms', 'dresses'];

export async function POST(request: Request) {
  const requestId = randomUUID();

  try {
    const body = (await request.json()) as {
      modelImage?: string;
      garmentImage?: string;
      category?: GarmentCategory;
    };

    const { modelImage, garmentImage, category } = body;

    if (!modelImage || !garmentImage || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing model image, garment image, or category.' },
        { status: 400 },
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid garment category.' },
        { status: 400 },
      );
    }

    const afterQuota = await consumeQuota();

    if (!afterQuota) {
      const quota = await getQuota();
      return NextResponse.json(
        {
          success: false,
          code: 'QUOTA_EXCEEDED',
          error: quota.isRegistered
            ? 'You have used all 5 try-ons this month. Come back next month.'
            : 'Your free try-on is used. Create an account for 5 try-ons per month.',
        },
        { status: 429 },
      );
    }

    const useMock = process.env.TRY_ON_MOCK === 'true' || !process.env.ARK_API_KEY?.trim();

    if (useMock) {
      devLog('try-on', 'mock response', { requestId });
      await saveTryOnRecord({
        category,
        garmentImageUrl: garmentImage,
        resultImageUrl: modelImage,
      });
      return NextResponse.json({
        success: true,
        resultImage: modelImage,
        mock: true,
        code: 'MOCK',
        remaining: afterQuota.remaining,
      });
    }

    devLog('try-on', 'starting generation', { requestId, category });

    const outputUrl = await runArkVirtualTryOn({
      personImage: modelImage,
      garmentImage,
      category,
      requestId,
    });

    const resultImage = await fetchImageAsDataUrl(outputUrl);

    await saveTryOnRecord({
      category,
      garmentImageUrl: garmentImage,
      resultImageUrl: resultImage,
    });

    devLog('try-on', 'completed', { requestId, remaining: afterQuota.remaining });

    return NextResponse.json({
      success: true,
      resultImage,
      remaining: afterQuota.remaining,
    });
  } catch (err) {
    if (err instanceof TryOnServiceError) {
      devLog('try-on', 'service error', {
        requestId,
        code: err.code,
        message: err.message,
      });
      return NextResponse.json(
        {
          success: false,
          code: err.code,
          error: toClientMessage(err.code),
        },
        { status: toHttpStatus(err.code) },
      );
    }

    const message = err instanceof Error ? err.message : 'Try-on failed';
    devLog('try-on', 'unexpected error', { requestId, message });
    return NextResponse.json(
      { success: false, code: 'API_ERROR', error: message },
      { status: 500 },
    );
  }
}
