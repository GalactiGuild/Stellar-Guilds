'use client'

import React, { ReactNode, ErrorInfo, Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------- types ---------- */

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional custom fallback UI */
  fallback?: ReactNode
  /** Callback for error reporting / analytics */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Custom class for the wrapper */
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/* ---------- component ---------- */

class ErrorBoundaryInner extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // Report to external analytics service if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Always log to console as fallback
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default dark-themed fallback UI
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center min-h-[300px] p-8',
            'rounded-xl border border-stellar-lightNavy bg-stellar-navy/80',
            this.props.className
          )}
          role="alert"
        >
          {/* Icon */}
          <div className="mb-4 rounded-full bg-red-500/10 p-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>

          {/* Message */}
          <h3 className="text-xl font-semibold text-stellar-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-stellar-slate text-center max-w-md mb-6">
            This component crashed unexpectedly. You can try again or go back to
            the home page.
          </p>

          {/* Error details (dev only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 w-full max-w-lg">
              <summary className="cursor-pointer text-xs text-stellar-slate hover:text-stellar-white transition-colors mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-red-300 bg-red-950/30 p-3 rounded-lg overflow-auto max-h-48">
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={this.reset}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                'bg-violet-500/20 text-violet-300 border border-violet-500/30',
                'hover:bg-violet-500/30 transition-colors'
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                'bg-stellar-lightNavy text-stellar-slate border border-stellar-lightNavy',
                'hover:text-stellar-white transition-colors'
              )}
            >
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/* ---------- public wrapper ---------- */

export function ErrorBoundary(props: ErrorBoundaryProps): ReactNode {
  return <ErrorBoundaryInner {...props} />
}

export default ErrorBoundary
