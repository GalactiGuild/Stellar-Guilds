'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BountyGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive grid layout for bounty cards.
 * - Mobile (<640px): 1 column
 * - Tablet (≥640px): 2 columns
 * - Desktop (≥1024px): 3 columns
 * - Wide (≥1280px): 4 columns
 */
export function BountyGrid({ children, className }: BountyGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default BountyGrid;
