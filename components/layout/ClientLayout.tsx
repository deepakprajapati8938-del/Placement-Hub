'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ToastProvider } from '@/components/ui/Toast'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

interface UserProfile {
  id: string
  full_name?: string
  avatar_slug?: string
  xp?: number
  streak?: number
  target_companies?: string[]
  email?: string
}

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const isAuthPage = ['/', '/login', '/signup'].includes(pathname)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        setUser({ 
          ...(profile || {}), 
          id: authUser.id,
          email: authUser.email 
        } as UserProfile)
      } else {
        setUser(null)
      }
    }

    getUser()

    // Check for dark mode preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      Promise.resolve().then(() => setIsDarkMode(true))
    }

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <ToastProvider>
      <div className="aurora-bg min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Decorative Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="aurora-orb-blue" />
          <div className="aurora-orb-pink" />
        </div>
        
        <div className="flex flex-1 relative z-10 overflow-hidden">
          {!isAuthPage && (
            <Sidebar 
              user={user}
              onThemeToggle={toggleTheme}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
            />
          )}
          <main className={cn(
            "flex-1 overflow-y-auto",
            !isAuthPage && "pb-24 md:pb-0"
          )}>
            {children}
          </main>
        </div>
        
        {!isAuthPage && (
          <MobileNav 
            onThemeToggle={toggleTheme}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            email={user?.email}
          />
        )}
      </div>
    </ToastProvider>
  )
}
