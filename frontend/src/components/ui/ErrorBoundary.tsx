'use client'

import React, { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by UI ErrorBoundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <div
        className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-center shadow-xl shadow-black/20"
        role="alert"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-300">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          This section crashed unexpectedly. Try again, or continue using the rest of the app.
        </p>

        {process.env.NODE_ENV === 'development' && this.state.error && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-red-500/20 bg-slate-950/80 p-3 text-left text-xs text-red-200">
            {this.state.error.message}
          </pre>
        )}

        <Button className="mt-5" variant="secondary" onClick={this.handleReset}>
          Try Again
        </Button>
      </div>
    )
  }
}

interface ErrorBoundaryDemoState {
  shouldThrow: boolean
}

class ThrowOnDemand extends React.Component<Record<string, never>, ErrorBoundaryDemoState> {
  state: ErrorBoundaryDemoState = { shouldThrow: false }

  render() {
    if (this.state.shouldThrow) {
      throw new Error('Manual ErrorBoundary demo crash')
    }

    return (
      <Button variant="outline" onClick={() => this.setState({ shouldThrow: true })}>
        Trigger demo error
      </Button>
    )
  }
}

export function ErrorBoundaryDemo() {
  return (
    <ErrorBoundary>
      <ThrowOnDemand />
    </ErrorBoundary>
  )
}
