'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTryOn } from '@/context/try-on-context';
import { CATEGORY_LABELS } from '@/lib/storage';
import { downloadDataUrl } from '@/lib/utils';

interface DbRecord {
  id: string;
  category: string;
  resultImageUrl: string;
  createdAt: string;
}

function HistoryContent() {
  const { user } = useTryOn();
  const [items, setItems] = useState<DbRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => setItems(data.records ?? []))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-6 py-24 text-center">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#1d1d1f]">
          Sign in to view history
        </h1>
        <p className="mt-4 text-[17px] text-[#86868b]">
          Your try-on previews are saved to your account after you register.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/sign-in">
            <Button variant="outline" glow={false}>
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button>Create Account</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-[40px] font-semibold tracking-tight text-[#1d1d1f]">History</h1>
          <p className="mt-2 text-[17px] text-[#86868b]">Your saved try-on previews.</p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" glow={false}>
            New try-on
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-[17px] text-[#86868b]">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-[17px] text-[#86868b]">
            No previews yet.{' '}
            <Link href="/" className="text-[#0071e3] hover:underline">
              Start your first try-on
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-[15px] font-medium">
                  {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ??
                    item.category}{' '}
                  · {new Date(item.createdAt).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f5f5f7]">
                  <Image
                    src={item.resultImageUrl}
                    alt="Try-on result"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  glow={false}
                  onClick={() =>
                    downloadDataUrl(item.resultImageUrl, `fitpreview-${item.id}.png`)
                  }
                >
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

export default function HistoryPage() {
  return (
    <>
      <SiteHeader />
      <HistoryContent />
    </>
  );
}
