import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-card",
          hover && "hover:bg-bg-surface-hover transition-all duration-200",
          className
        )}
        whileHover={hover ? { y: -2 } : undefined}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = "CardHeader"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  )
)

CardContent.displayName = "CardContent"
