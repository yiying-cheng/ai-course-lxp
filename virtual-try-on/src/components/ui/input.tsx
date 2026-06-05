import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-12 w-full rounded-xl border-0 bg-[#f5f5f7] px-4 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
