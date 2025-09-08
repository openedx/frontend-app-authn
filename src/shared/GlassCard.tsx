import React from 'react';

import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className }: CardProps) => (
  <div
    className={cn(
      'tw-flex tw-items-center tw-justify-center tw-h-full tw-w-full',
      'tw-border-solid tw-border-[2px] tw-border-white',
      'tw-bg-gradient-to-br tw-from-white/30 tw-to-white/70 tw-backdrop-blur-xl',
      'tw-rounded-[20px]',
      className,
    )}
  >
    {children}
  </div>
);

export default GlassCard;
