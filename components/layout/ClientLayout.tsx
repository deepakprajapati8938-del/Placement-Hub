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
  const [isLoading, setIsLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const publicPages = ['/', '/login', '/signup', '/roadmap']
  const isPublicPage = publicPages.includes(pathname)
  const showAppLayout = !!user && !['/', '/login', '/signup'].includes(pathname)

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError)
          }

          setUser({ 
            ...(profile || {}), 
            id: authUser.id,
            email: authUser.email 
          } as UserProfile)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error in getUser:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    getUser()

    // Check for theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsDarkMode(false)
    } else {
      setIsDarkMode(true)
    }

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        getUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
        setIsInitialized(true)
      } else if (event === 'INITIAL_SESSION' && !session) {
        setIsLoading(false)
        setIsInitialized(true)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    // Don't redirect until we've finished the initial auth check
    if (isLoading || !isInitialized) return

    // Redirect to login if not authenticated and trying to access protected page
    if (!user && !isPublicPage) {
      router.push('/login')
    }
  }, [user, isLoading, isInitialized, isPublicPage, router])

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
      setUser(null)
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
          {showAppLayout && (
            <Sidebar 
              user={user}
              onThemeToggle={toggleTheme}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
            />
          )}
          <main className={cn(
            "flex-1 overflow-y-auto",
            showAppLayout && "pb-24 md:pb-0"
          )}>
            {children}
          </main>
        </div>
        
        {showAppLayout && (
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
