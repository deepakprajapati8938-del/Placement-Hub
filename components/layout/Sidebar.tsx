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
  Settings, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/features/Avatar'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  user?: {
    full_name?: string
    avatar_slug?: string
    xp?: number
    email?: string
  } | null
  onThemeToggle?: () => void
  onLogout?: () => void
  isDarkMode?: boolean
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home },
  { id: 'leaderboard', label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { id: 'notes', label: 'Study Notes', href: '/notes', icon: BookOpen },
  { id: 'roadmap', label: 'Roadmap', href: '/roadmap', icon: Map },
  { id: 'admin-roadmap', label: 'Roadmap Builder', href: '/admin/roadmap-builder', icon: Map, isAdmin: true },
  { id: 'admin-tasks', label: 'Manage Tasks', href: '/admin/tasks', icon: Settings, isAdmin: true },
  { id: 'admin-notes', label: 'Manage Notes', href: '/admin/notes', icon: BookOpen, isAdmin: true },
]

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  onThemeToggle, 
  onLogout,
  isDarkMode = false 
}) => {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(item => {
    if ((item as any).isAdmin) {
      return user?.email?.toLowerCase() === 'dp7800549@gmail.com'
    }
    return true
  })

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-glass-border bg-surface backdrop-blur-glass overflow-hidden">
      {/* Logo and Theme Toggle */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-purple-strong rounded-lg flex items-center justify-center shadow-lg shadow-accent-purple/20">
              <span className="text-white font-bold text-sm">PH</span>
            </div>
            <span className="font-semibold text-text-primary">Placement Hub</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            className="p-2 hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <Avatar slug={user.avatar_slug || 'default'} size="md" className="border border-glass-border-purple" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-text-primary">{user.full_name || 'User'}</p>
              <p className="text-xs text-text-muted font-mono">{user.xp || 0} XP</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.id}>
                <Link href={item.href}>
                  <motion.div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      isActive
                        ? "bg-accent-purple-strong text-white shadow-md shadow-accent-purple/30"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover"
                    )}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-glass-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover" 
          size="sm"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
