'use client';

import Link from 'next/link';
import { Download, Loader2, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { ImageUpload } from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTryOn } from '@/context/try-on-context';
import { CATEGORY_LABELS } from '@/lib/storage';
import type { GarmentCategory } from '@/lib/types';
import { downloadDataUrl, cn } from '@/lib/utils';

const categories: GarmentCategory[] = ['tops', 'bottoms', 'dresses'];

export function TryOnStudio() {
  const {
    step,
    persona,
    garmentDataUrl,
    category,
    resultImage,
    error,
    isMock,
    quota,
    user,
    setCategory,
    setPersonaFromFile,
    setGarmentFromFile,
    generateTryOn,
    resetForAnotherGarment,
  } = useTryOn();

  if (step === 'generating') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-24 text-center">
        <Loader2 className="mb-6 h-10 w-10 animate-spin text-[#86868b]" strokeWidth={1.5} />
        <h2 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">
          Creating your preview
        </h2>
        <p className="mt-3 max-w-sm text-[17px] leading-relaxed text-[#86868b]">
          This usually takes 10–30 seconds. We prioritize quality over speed.
        </p>
      </div>
    );
  }

  if (step === 'result' && resultImage) {
    return (
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your preview</CardTitle>
            <CardDescription>For purchase reference — not a fit guarantee.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#f5f5f7]">
              <Image
                src={resultImage}
                alt="Try-on result"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            {isMock && (
              <p className="rounded-2xl bg-[#fff8ec] px-4 py-3 text-[14px] text-[#bf4800]">
                Demo mode — add ARK_API_KEY in .env.local for real AI try-on.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  downloadDataUrl(resultImage, `fitpreview-${Date.now()}.png`)
                }
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Download
              </Button>
              <Button variant="outline" glow={false} onClick={resetForAnotherGarment}>
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                Try another
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Keep exploring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-[15px] leading-relaxed text-[#86868b]">
            <p>Your photo is saved. Upload another garment to compare options.</p>
            {user ? (
              <p>
                View all results in{' '}
                <Link href="/history" className="text-[#0071e3] hover:underline">
                  History
                </Link>
                .
              </p>
            ) : (
              <p>
                <Link href="/sign-up" className="text-[#0071e3] hover:underline">
                  Create an account
                </Link>{' '}
                for 5 try-ons per month and saved history.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const canGenerate = Boolean(persona?.dataUrl && garmentDataUrl);
  const outOfQuota = quota?.remaining === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <section className="space-y-4 text-center">
        <p className="text-[14px] font-medium uppercase tracking-[0.12em] text-[#86868b]">
          Virtual Try-On
        </p>
        <h1 className="text-[40px] font-semibold leading-tight tracking-tight text-[#1d1d1f] md:text-[48px]">
          See it on you.
          <br className="hidden sm:block" />
          Before you buy.
        </h1>
        <p className="mx-auto max-w-xl text-[19px] leading-relaxed text-[#86868b]">
          Upload your photo and any garment image. Get a clear preview for smarter shopping
          decisions.
        </p>
        {quota && (
          <p className="text-[14px] text-[#86868b]">
            {user
              ? `${quota.remaining} of ${quota.limit} try-ons left this month`
              : `${quota.remaining} free try-on before sign-up`}
          </p>
        )}
      </section>

      {error && (
        <div className="mx-auto max-w-2xl rounded-2xl bg-[#fff2f2] px-5 py-4 text-center text-[15px] text-[#bf4800]">
          {error}
        </div>
      )}

      {outOfQuota && (
        <div className="mx-auto max-w-2xl rounded-2xl bg-[#f5f5f7] px-5 py-4 text-center text-[15px] text-[#1d1d1f]">
          {user ? (
            <>You&apos;ve used all 5 try-ons this month. Come back next month.</>
          ) : (
            <>
              Your free try-on is used.{' '}
              <Link href="/sign-up" className="text-[#0071e3] hover:underline">
                Create an account
              </Link>{' '}
              for 5 try-ons every month.
            </>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your photo</CardTitle>
            <CardDescription>
              Saved on this device. A clear, front-facing photo works best.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              label="My look"
              hint="Upload a photo of yourself"
              previewUrl={persona?.dataUrl}
              onFile={setPersonaFromFile}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Garment</CardTitle>
            <CardDescription>
              A screenshot or saved image from any online store.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload
              label="Clothing item"
              hint="Upload the garment image"
              previewUrl={garmentDataUrl}
              onFile={setGarmentFromFile}
            />
            <div>
              <p className="mb-3 text-[15px] font-medium text-[#1d1d1f]">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      'rounded-full px-4 py-2 text-[14px] font-medium transition',
                      category === c
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]',
                    )}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pb-8">
        <Button size="lg" disabled={!canGenerate || outOfQuota} onClick={generateTryOn}>
          Generate Preview
        </Button>
      </div>
    </div>
  );
}
