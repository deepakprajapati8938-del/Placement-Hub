import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BacklogBannerProps {
  count: number
  onView?: () => void
  onDismiss?: () => void
  show?: boolean
}

export const BacklogBanner: React.FC<BacklogBannerProps> = ({
  count,
  onView,
  onDismiss,
  show = true
}) => {
  if (!show || count === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="sticky top-0 z-50"
      >
        <div className="bg-warning/10 border-l-4 border-warning px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">
                You have <span className="font-bold">{count}</span> overdue task{count > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-text-muted">
                Clear them to boost your rank →
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={onView}
              className="text-xs py-1.5 px-3"
            >
              View
            </Button>
            <button 
              onClick={onDismiss}
              className="text-text-muted hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
