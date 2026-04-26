import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading = false, disabled, onClick, type = 'button', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    
    const variants = {
      default: "btn-aurora shadow-lg shadow-accent-purple/20",
      primary: "btn-aurora shadow-lg shadow-accent-purple/20",
      secondary: "btn-aurora-ghost",
      outline: "btn-aurora-ghost border-glass-border",
      ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover",
      danger: "bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30"
    }
    
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-base"
    }

    return (
      <motion.button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        type={type}
        onClick={onClick}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = "Button"
