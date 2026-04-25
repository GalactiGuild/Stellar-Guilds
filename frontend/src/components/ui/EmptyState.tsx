import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface EmptyStateProps {
  title?: string
  description?: string
  createLabel?: string
  onCreate: () => void
  className?: string
  buttonClassName?: string
  illustration?: React.ReactNode
}

const DefaultIllustration = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 120 120"
    className="h-24 w-24 text-stellar-slate"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="60" cy="60" r="56" className="fill-stellar-lightNavy/40 stroke-stellar-slate/40" strokeWidth="2" />
    <rect x="33" y="41" width="54" height="38" rx="8" className="fill-stellar-navy/90 stroke-stellar-slate/50" strokeWidth="2" />
    <path d="M41 53H79" className="stroke-stellar-slate" strokeWidth="2" strokeLinecap="round" />
    <path d="M41 61H69" className="stroke-stellar-slate" strokeWidth="2" strokeLinecap="round" />
    <circle cx="82" cy="82" r="12" className="fill-violet-500" />
    <path d="M82 77V87" className="stroke-stellar-navy" strokeWidth="2" strokeLinecap="round" />
    <path d="M77 82H87" className="stroke-stellar-navy" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const EmptyState = ({
  title = 'Nothing here yet',
  description = 'Once items are created, they will appear here.',
  createLabel = 'Create',
  onCreate,
  className,
  buttonClassName,
  illustration,
}: EmptyStateProps) => {
  return (
    <section
      className={cn(
        'mx-auto flex min-h-[300px] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-dashed border-stellar-slate/40 bg-stellar-lightNavy/20 px-6 py-12 text-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-5">{illustration ?? <DefaultIllustration />}</div>

      <div className="prose prose-invert max-w-md text-center">
        <h3 className="mb-2 text-2xl font-semibold tracking-tight text-stellar-white">{title}</h3>
        <p className="m-0 text-base text-stellar-slate">{description}</p>
      </div>

      <Button
        className={cn(
          'mt-8 bg-violet-500 text-black hover:bg-violet-400',
          buttonClassName
        )}
        onClick={onCreate}
      >
        {createLabel}
      </Button>
    </section>
  )
}

export { EmptyState }
