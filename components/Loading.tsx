import React from 'react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`}>
        <div className="w-2 h-2 bg-primary rounded-full"></div>
      </div>
      {message && (
        <p className="mt-4 text-sm text-text-muted animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin ${className}`}>
      <div className="w-2 h-2 bg-primary rounded-full"></div>
    </div>
  )
}

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-border dark:bg-border-dark rounded ${className}`}>
      <div className="h-4 bg-border dark:bg-border-dark rounded mb-2"></div>
      <div className="h-4 bg-border dark:bg-border-dark rounded mb-2"></div>
      <div className="h-4 bg-border dark:bg-border-dark rounded mb-2"></div>
      <div className="h-4 bg-border dark:bg-border-dark rounded w-3/4"></div>
    </div>
  )
}
