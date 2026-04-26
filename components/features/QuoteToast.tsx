import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Avatar } from './Avatar'
import { cn } from '@/lib/utils'

interface QuoteToastProps {
  quote: string
  context?: string
  isSavage?: boolean
  user?: {
    avatar_slug: string
  }
  onDismiss?: () => void
  show?: boolean
}

export const QuoteToast: React.FC<QuoteToastProps> = ({
  quote,
  context,
  isSavage = false,
  user,
  onDismiss,
  show = false
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss?.()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onDismiss])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn(
            "fixed z-50 max-w-sm mx-4 card shadow-float border-l-4",
            "bottom-4 left-1/2 -translate-x-1/2",
            "md:bottom-auto md:top-4 md:left-auto md:right-4 md:translate-x-0",
            isSavage ? "border-danger" : "border-primary"
          )}
        >
          <div className="flex items-start gap-3">
            {/* Avatar Reaction */}
            <div className="flex-shrink-0">
              <Avatar 
                slug={user?.avatar_slug || 'default'} 
                size="sm" 
                reaction={isSavage ? 'disappointed' : 'happy'} 
              />
            </div>
            
            {/* Quote Text */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                isSavage ? "text-danger" : "text-primary"
              )}>
                {quote}
              </p>
              {context && (
                <p className="text-xs text-text-muted mt-1">{context}</p>
              )}
            </div>
            
            {/* Close */}
            <button 
              onClick={onDismiss}
              className="text-text-muted hover:text-text transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress Bar (auto-dismiss visual) */}
          <motion.div
            className="h-0.5 bg-border dark:bg-border-dark mt-3 rounded-full overflow-hidden"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
