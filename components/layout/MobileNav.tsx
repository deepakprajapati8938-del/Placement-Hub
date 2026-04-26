'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Home, 
  Trophy, 
  BookOpen, 
  Map, 
  User,
  Moon,
  Sun,
  LogOut,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Home', href: '/dashboard', icon: Home },
  { id: 'leaderboard', label: 'Rank', href: '/leaderboard', icon: Trophy },
  { id: 'notes', label: 'Notes', href: '/notes', icon: BookOpen },
  { id: 'roadmap', label: 'Roadmap', href: '/roadmap', icon: Map },
  { id: 'admin', label: 'Admin', href: '/admin/tasks', icon: Settings },
]

interface MobileNavProps {
  onThemeToggle?: () => void
  onLogout?: () => void
  isDarkMode?: boolean
  email?: string
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  onThemeToggle, 
  onLogout,
  isDarkMode = false,
  email
}) => {
  const pathname = usePathname()

  const filteredTabs = tabs.filter(tab => {
    if (tab.id === 'admin') {
      return email?.toLowerCase() === 'dp7800549@gmail.com'
    }
    return true
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-glass-border z-50 md:hidden">
      <div className="flex justify-around items-center py-2 px-1">
        {filteredTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href
          
          return (
            <Link key={tab.id} href={tab.href} className="flex-1">
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 py-1 rounded-lg transition-all duration-200",
                  isActive 
                    ? "text-accent-purple-strong" 
                    : "text-text-secondary hover:text-text-primary"
                )}
                whileTap={{ scale: 0.9 }}
              >
                <div className={cn(
                  "p-1 rounded-md transition-colors",
                  isActive && "bg-accent-purple/10"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
              </motion.div>
            </Link>
          )
        })}
        
        {/* Theme Toggle in Mobile Nav */}
        <button 
          onClick={onThemeToggle}
          className="flex-1 flex flex-col items-center gap-1 py-1 text-text-secondary"
        >
          <div className="p-1">
            {isDarkMode ? <Sun className="w-5 h-5 text-accent-teal" /> : <Moon className="w-5 h-5 text-accent-purple" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>

        {/* Logout in Mobile Nav */}
        <button 
          onClick={onLogout}
          className="flex-1 flex flex-col items-center gap-1 py-1 text-text-secondary hover:text-danger transition-colors"
        >
          <div className="p-1">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Exit</span>
        </button>
      </div>
    </nav>
  )
}
