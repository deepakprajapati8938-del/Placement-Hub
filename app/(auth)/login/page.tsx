'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Handle browser auto-fill
  React.useEffect(() => {
    const checkAutoFill = () => {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
      if (emailInput?.value && emailInput.value !== email) setEmail(emailInput.value)
      if (passwordInput?.value && passwordInput.value !== password) setPassword(passwordInput.value)
    }
    
    const timer = setTimeout(checkAutoFill, 500)
    return () => clearTimeout(timer)
  }, [email, password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setIsRedirecting(true)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to login')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      {/* Background Orbs specifically for auth pages to ensure visibility */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="aurora-orb-blue opacity-40 -top-20 -right-20" />
        <div className="aurora-orb-purple opacity-30 bottom-0 left-0" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card glass-card--blue overflow-hidden">
          <CardHeader className="pb-2">
            <div className="text-center space-y-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-accent-blue-strong rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-accent-blue/20 mb-2"
              >
                <Lock className="text-white w-6 h-6" />
              </motion.div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Welcome Back
              </h1>
              <p className="text-text-secondary text-xs">
                Sign in to continue your placement prep journey
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="w-4 h-4" />}
              />

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock className="w-4 h-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 p-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full btn-aurora h-11"
                loading={loading || isRedirecting}
                disabled={(!email || !password) && !loading}
              >
                {isRedirecting ? 'Redirecting...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-glass-border text-center">
              <p className="text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link 
                  href="/signup"
                  className="text-accent-blue font-bold hover:text-accent-blue-strong transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </div>
      </motion.div>
    </div>
  )
}
