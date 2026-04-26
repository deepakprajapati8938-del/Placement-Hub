'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  duration?: number
  onClose: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const variants = {
    default: "bg-background border border-border",
    success: "bg-success/10 border-success text-success-foreground",
    warning: "bg-warning/10 border-warning text-warning-foreground", 
    error: "bg-danger/10 border-danger text-danger-foreground"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border",
        variants[variant]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-medium text-sm">{title}</p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <motion.div
        className="h-0.5 bg-border mt-3 rounded-full overflow-hidden"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  )
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    setToasts(prev => [...prev, { ...toast, id, onClose: removeToast }])
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}

const ToastContext = React.createContext<{
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void
}>({
  addToast: () => {}
})

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
