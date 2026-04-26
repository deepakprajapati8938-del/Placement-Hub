import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary'
  children: React.ReactNode
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: "pill pill--purple",
      success: "pill pill--teal",
      warning: "pill pill--pink", 
      danger: "pill bg-danger/20 border border-danger/30 text-danger",
      secondary: "pill pill--blue"
    }

    return (
      <span
        ref={ref}
        className={cn(
          "badge",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"
