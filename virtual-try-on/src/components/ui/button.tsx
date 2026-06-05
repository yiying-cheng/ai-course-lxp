'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 text-[17px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/40 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-[#1d1d1f] text-white hover:bg-[#333336]',
        secondary: 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]',
        outline: 'border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]',
        ghost: 'text-[#0071e3] hover:bg-[#f5f5f7]',
        link: 'text-[#0071e3] hover:underline px-0 h-auto',
      },
      size: {
        default: 'h-11 px-5 rounded-full',
        sm: 'h-9 px-4 text-[15px] rounded-full',
        lg: 'h-12 px-8 text-[17px] rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  glow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glow, children, ...props }, ref) => {
    const showGlow = glow ?? variant === 'default';

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          showGlow && 'relative overflow-hidden',
          className,
        )}
        {...props}
      >
        {showGlow && (
          <GlowingEffect
            disabled={false}
            glow
            spread={40}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
            movementDuration={1.5}
          />
        )}
        <span
          className={cn(
            'relative z-10 inline-flex items-center justify-center gap-2',
            showGlow && 'pointer-events-none',
          )}
        >
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = 'Button';
