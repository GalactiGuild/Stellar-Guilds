'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  className?: string
  label?: string
}

interface LoadingOverlayProps {
  isOpen: boolean
  className?: string
  spinnerColor?: string
  label?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function Spinner({
  size = 'md',
  color = 'text-cyan-500',
  className,
  label = 'Loading',
}: SpinnerProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center', sizeClasses[size], color, className)}
      role="status"
      aria-label={label}
    >
      <motion.svg
        className="h-full w-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function LoadingOverlay({
  isOpen,
  className,
  spinnerColor = 'text-cyan-500',
  label = 'Loading',
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'absolute inset-0 z-50 flex items-center justify-center rounded-inherit bg-slate-950/70 backdrop-blur-sm',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          aria-live="polite"
          aria-busy="true"
        >
          <motion.div
            className="flex flex-col items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-900/80 px-6 py-5 shadow-2xl shadow-black/30"
            initial={{ scale: 0.96, y: 4 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 4 }}
            transition={{ duration: 0.18 }}
          >
            <Spinner size="lg" color={spinnerColor} label={label} />
            <span className="text-sm font-medium text-slate-200">{label}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
