'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<
  { children?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            
            <h1 className="text-2xl font-bold text-text mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-text-muted mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              
              <details className="text-left">
                <summary className="text-sm text-text-muted cursor-pointer hover:text-text transition-colors">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-card dark:bg-bg-card-dark rounded-lg text-xs">
                  <div className="space-y-1">
                    <div>
                      <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-x-auto bg-background dark:bg-bg-card-dark p-2 rounded">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children || null
  }
}

interface FallbackErrorProps {
  error: Error
  resetErrorBoundary: () => void
}

export function FallbackError({ error, resetErrorBoundary }: FallbackErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            
        <h1 className="text-2xl font-bold text-text mb-2">
          Something went wrong
        </h1>
        
        <p className="text-text-muted mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        
        <Button 
          onClick={resetErrorBoundary}
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  )
}
