import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Animation variant
   * - shimmer: Sliding gradient effect (default)
   * - pulse: Simple opacity pulse
   */
  animation?: 'shimmer' | 'pulse'
  /**
   * Skeleton shape variant
   * - text: Rounded corners for text lines
   * - circular: Circle for avatars
   * - rectangular: Full rounded corners for cards/images
   */
  variant?: 'text' | 'circular' | 'rectangular'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animation = 'shimmer', variant = 'text', ...props }, ref) => {
    const baseClasses = "bg-stellar-lightNavy overflow-hidden relative"

    const variantClasses = {
      text: "rounded-md",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    }

    const animationClasses = {
      shimmer: "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-stellar-slate/10 before:to-transparent",
      pulse: "animate-[pulse_1.5s_ease-in-out_infinite]",
    }

    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Skeleton.displayName = "Skeleton"

export { Skeleton }
