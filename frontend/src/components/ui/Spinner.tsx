'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/* ---------- types ---------- */

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  /** Tailwind color class — default: text-violet-400 */
  colorClass?: string
}

/* ---------- size map ---------- */

const SIZE_MAP: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

/* ---------- component ---------- */

export function Spinner({
  size = 'md',
  className,
  colorClass = 'text-violet-400',
}: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin', SIZE_MAP[size], colorClass, className)}
      role="status"
      aria-label="Loading"
    />
  )
}

/* ---------- LoadingOverlay ---------- */

interface LoadingOverlayProps {
  isOpen: boolean
  /** Optional label text below spinner */
  label?: string
  /** Custom spinner size */
  spinnerSize?: SpinnerSize
  className?: string
}

export function LoadingOverlay({
  isOpen,
  label,
  spinnerSize = 'lg',
  className,
}: LoadingOverlayProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-stellar-navy/70 backdrop-blur-sm transition-opacity',
        className
      )}
      role="alert"
      aria-busy="true"
      aria-label={label || 'Loading'}
    >
      <Spinner size={spinnerSize} />
      {label && (
        <p className="mt-3 text-sm text-stellar-slate animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}

/* ---------- PageSkeleton (full-page placeholder) ---------- */

interface PageSpinnerProps {
  /** Full-screen center */
  fullscreen?: boolean
  label?: string
  spinnerSize?: SpinnerSize
}

export function PageSpinner({
  fullscreen = false,
  label,
  spinnerSize = 'lg',
}: PageSpinnerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullscreen ? 'min-h-screen' : 'py-20'
      )}
      role="status"
    >
      <Spinner size={spinnerSize} />
      {label && (
        <p className="text-sm text-stellar-slate">{label}</p>
      )}
    </div>
  )
}

export default Spinner
