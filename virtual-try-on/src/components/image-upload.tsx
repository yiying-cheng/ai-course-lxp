'use client';

import { Upload } from 'lucide-react';
import Image from 'next/image';
import { useRef, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  label: string;
  hint: string;
  previewUrl?: string | null;
  onFile: (file: File) => void;
  accept?: string;
}

export function ImageUpload({
  label,
  hint,
  previewUrl,
  onFile,
  accept = 'image/jpeg,image/png,image/webp',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium text-[#1d1d1f]">{label}</p>
        <button
          type="button"
          className="text-[13px] text-[#0071e3] hover:underline"
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? 'Change' : 'Choose file'}
        </button>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex min-h-[220px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#f5f5f7] transition hover:bg-[#e8e8ed]',
          previewUrl && 'bg-white ring-1 ring-[#d2d2d7]/80',
        )}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={label}
            fill
            className="object-contain p-3"
            unoptimized
          />
        ) : (
          <>
            <Upload className="mb-3 h-7 w-7 text-[#86868b]" strokeWidth={1.5} />
            <span className="text-[15px] text-[#86868b]">{hint}</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
