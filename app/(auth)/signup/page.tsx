'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AvatarSelector } from '@/components/features/Avatar'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarSlug, setAvatarSlug] = useState('default')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Sign up user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_slug: avatarSlug,
          }
        }
      })

      if (signUpError) throw signUpError

      if (!user) {
        throw new Error('Failed to create account')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = step === 1 ? fullName && email : fullName && email && password && confirmPassword

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      {/* Background Orbs specifically for auth pages to ensure visibility */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="aurora-orb-purple opacity-40 -top-20 -left-20" />
        <div className="aurora-orb-teal opacity-30 bottom-0 right-0" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card glass-card--purple overflow-hidden">
          <CardHeader className="pb-4">
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-accent-purple-strong rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-accent-purple/20 mb-2"
              >
                <User className="text-white w-6 h-6" />
              </motion.div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Join Placement Hub
              </h1>
              <p className="text-text-secondary text-sm">
                Start your journey to ace campus placements
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <Input
                    type="text"
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    icon={<User className="w-4 h-4" />}
                  />

                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    icon={<Mail className="w-4 h-4" />}
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">
                      Choose Your Avatar
                    </label>
                    <div className="p-2 rounded-2xl bg-bg-surface-hover/50 border border-glass-border">
                      <AvatarSelector
                        selected={avatarSlug}
                        onSelect={setAvatarSlug}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Password */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="Create a strong password"
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

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      icon={<Lock className="w-4 h-4" />}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-9 p-2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-accent-teal/5 border border-accent-teal/20">
                    <p className="text-xs text-accent-teal leading-relaxed">
                      💡 Your account will be created securely.
                    </p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium flex items-center gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                  {error}
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex gap-4 pt-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                {step < 2 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed}
                    className="flex-1 btn-aurora"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={!canProceed}
                    className="flex-1 btn-aurora"
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-glass-border text-center">
              <p className="text-sm text-text-secondary">
                Already have an account?{' '}
                <Link 
                  href="/login"
                  className="text-accent-purple font-bold hover:text-accent-purple-strong transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </div>
      </motion.div>
    </div>
  )
}
