'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { TaskCard } from '@/components/features/TaskCard'
import { BacklogBanner } from '@/components/features/BacklogBanner'
import { QuoteToast } from '@/components/features/QuoteToast'
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/db/types'

type Task = Database['public']['Tables']['tasks']['Row']
type UserTask = Database['public']['Tables']['user_tasks']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function DashboardPage() {
  const [tasks, setTasks] = useState<(Task & UserTask)[]>([])
  const [user, setUser] = useState<Profile | null>(null)
  const [backlogCount, setBacklogCount] = useState(0)
  const [showQuote, setShowQuote] = useState(false)
  const [quoteData, setQuoteData] = useState({ quote: '', isSavage: false })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)
  const [showBacklogBanner, setShowBacklogBanner] = useState(true)

  const triggerQuote = useCallback(async (isSavage: boolean) => {
    try {
      const response = await fetch('/api/quotes/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: isSavage ? 'savage' : 'motivational' })
      })
      const data = await response.json()
      setQuoteData({ quote: data.quote, isSavage })
      setShowQuote(true)
    } catch (error) {
      console.error('Error fetching quote:', error)
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser(profile)

      // Get all tasks
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .order('deadline', { ascending: true })

      // Get user task statuses
      const { data: userTasks } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', authUser.id)

      // Combine tasks with user progress
      const tasksWithProgress = allTasks?.map((task: Task) => {
        const userTask = userTasks?.find((ut: UserTask) => ut.task_id === task.id)
        const is_backlog = !!(task.deadline && new Date(task.deadline) < new Date() && userTask?.status !== 'done')
        return {
          ...task,
          ...userTask,
          is_backlog
        }
      }) || []

      setTasks(tasksWithProgress as (Task & UserTask)[])
      
      // Calculate backlog count
      const backlogValue = tasksWithProgress.filter((t: any) => t.is_backlog).length
      setBacklogCount(backlogValue)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchData])

  useEffect(() => {
    // Trigger quote based on user actions
    if (tasks.length > 0) {
      const hasBacklog = backlogCount > 0
      const completedToday = tasks.filter(t => t.status === 'done').length > 0
      
      let timer: NodeJS.Timeout | null = null

      if (completedToday && Math.random() > 0.7) {
        // Show motivational quote
        timer = setTimeout(() => triggerQuote(false), 0)
      } else if (hasBacklog && Math.random() > 0.8) {
        // Show savage quote
        timer = setTimeout(() => triggerQuote(true), 0)
      }

      return () => {
        if (timer) clearTimeout(timer)
      }
    }
  }, [tasks, backlogCount, triggerQuote])

  const handleMarkDone = async (taskId: string) => {
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) return

      // Update user task status
      const { error } = await supabase
        .from('user_tasks')
        .update({ 
          status: 'done',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', authUser.id)
        .eq('task_id', taskId)

      if (error) throw error

      // Update user XP
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        const deadlineDate = task.deadline ? new Date(task.deadline) : new Date()
        const xp = Math.max(10 - 2 * Math.max(0, Math.ceil((new Date().getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24))), -10)
        
        // Get current profile for XP update
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', authUser.id)
          .single()

        await supabase
          .from('profiles')
          .update({ xp: (profile?.xp || 0) + xp })
          .eq('id', authUser.id)
      }

      await fetchData()
    } catch (error) {
      console.error('Error marking task done:', error)
    }
  }

  const handleReschedule = async (taskId: string) => {
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) return

      const userTask = tasks.find(t => t.id === taskId)
      if (!userTask || (userTask.reschedule_count || 0) >= 2) return

      // Reschedule task (add 3 days)
      const newDeadline = new Date()
      newDeadline.setDate(newDeadline.getDate() + 3)

      const { error } = await supabase
        .from('tasks')
        .update({ deadline: newDeadline.toISOString() })
        .eq('id', taskId)

      if (error) throw error

      // Update reschedule count
      await supabase
        .from('user_tasks')
        .update({ reschedule_count: (userTask.reschedule_count || 0) + 1 })
        .eq('user_id', authUser.id)
        .eq('task_id', taskId)

      await fetchData()
    } catch (error) {
      console.error('Error rescheduling task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    
    return matchesSearch && matchesPriority
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Quote Toast */}
      <AnimatePresence>
        {showQuote && (
          <QuoteToast
            quote={quoteData.quote}
            isSavage={quoteData.isSavage}
            user={user || undefined}
            onDismiss={() => setShowQuote(false)}
            show={showQuote}
          />
        )}
      </AnimatePresence>

      {/* Backlog Banner */}
      <BacklogBanner
        count={backlogCount}
        show={showBacklogBanner && backlogCount > 0}
        onDismiss={() => setShowBacklogBanner(false)}
        onView={() => {
          setFilterPriority('high')
          setSearchTerm('')
        }}
      />

      {/* Main Content */}
      <div className="pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text dark:text-text-dark">
                My Tasks
              </h1>
              <p className="text-sm text-text-muted">
                {backlogCount > 0 ? `${backlogCount} overdue tasks` : 'All caught up! 🎉'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="glass-input w-full md:w-64"
              />
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                className="glass-input w-32"
              >
                <option value="all">All Priority</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
                <option value="low">Low Only</option>
              </select>
            </div>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-text mb-2">
                {searchTerm || filterPriority !== 'all' ? 'No tasks found' : 'All caught up! 🎉'}
              </h3>
              <p className="text-sm text-text-muted">
                {searchTerm || filterPriority !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Great job! Take a break or add new tasks to stay ahead.'
                }
              </p>
            </motion.div>
          ) : (
            <ResponsiveGrid 
              cols={{ sm: 1, md: 2, lg: 3 }}
              gap={4}
            >
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onMarkDone={handleMarkDone}
                  onReschedule={handleReschedule}
                  showBacklogBadge
                />
              ))}
            </ResponsiveGrid>
          )}
        </div>
      </div>

    </div>
  )
}
