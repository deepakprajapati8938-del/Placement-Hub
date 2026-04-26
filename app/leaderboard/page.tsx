'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users } from 'lucide-react'
import { LeaderboardRow } from '@/components/features/LeaderboardRow'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Database } from '@/lib/db/types'

type LeaderboardEntry = Database['public']['Views']['leaderboard_rank']['Row']

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'top10' | 'friends'>('all')

  const fetchLeaderboard = React.useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch leaderboard data
      const { data: leaderboardData } = await supabase
        .from('leaderboard_rank')
        .select('*')
        .order('rank', { ascending: true })

      let filteredData = leaderboardData || []

      if (filter === 'top10') {
        filteredData = filteredData.slice(0, 10)
      } else if (filter === 'friends') {
        // TODO: Implement friends filtering
        filteredData = filteredData
      }

      setLeaderboard(filteredData)

      // Find current user
      if (user) {
        const currentUser = filteredData.find(entry => entry.id === user.id)
        setCurrentUserRank(currentUser || null)
      }
      
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaderboard()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchLeaderboard])

  const getRelativePosition = (currentRank: number, targetRank: number): number => {
    return targetRank - currentRank
  }

  const getStats = () => {
    const totalUsers = leaderboard.length
    const topPercentile = Math.round((10 / totalUsers) * 100)
    const yourPosition = currentUserRank ? currentUserRank.rank : null
    
    return {
      totalUsers,
      topPercentile,
      yourPosition,
      usersAhead: yourPosition ? yourPosition - 1 : null,
      percentile: yourPosition ? Math.round(((totalUsers - yourPosition + 1) / totalUsers) * 100) : null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12 pb-24 md:pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="w-10 h-10 text-accent-teal shadow-lg shadow-accent-teal/20" />
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">
              Global Leaderboard
            </h1>
          </div>
          <p className="text-text-secondary text-lg">
            Track your progress and compete with peers worldwide
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card glass-card--purple text-center p-6"
          >
            <div className="text-3xl font-bold text-accent-purple mb-1">
              {stats.totalUsers}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Users</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card glass-card--teal text-center p-6"
          >
            <div className="text-3xl font-bold text-accent-teal mb-1">
              #{currentUserRank?.rank || '-'}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Your Rank</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card glass-card--blue text-center p-6"
          >
            <div className="text-3xl font-bold text-accent-blue mb-1">
              {stats.percentile !== null ? `Top ${stats.percentile}%` : '-'}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Percentile</div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200",
              filter === 'all' 
                ? "btn-aurora" 
                : "btn-aurora-ghost"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('top10')}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200",
              filter === 'top10' 
                ? "btn-aurora" 
                : "btn-aurora-ghost"
            )}
          >
            Top 10
          </button>
          <button
            onClick={() => setFilter('friends')}
            className="btn-aurora-ghost opacity-50 cursor-not-allowed px-6 py-2.5 rounded-full text-sm font-bold"
            disabled
          >
            Friends
          </button>
        </div>

        {/* Current User Position */}
        {currentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card glass-card--purple mb-8 border-accent-purple/40 ring-1 ring-accent-purple/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center text-xl font-bold text-accent-purple">
                  #{currentUserRank.rank}
                </div>
                <div>
                  <div className="font-bold text-text-primary text-lg">{currentUserRank.full_name} <span className="text-accent-purple text-sm font-normal ml-1">(You)</span></div>
                  <div className="text-sm text-text-secondary">
                    {currentUserRank.xp} XP
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-text-secondary">
                  {stats.usersAhead !== null && `${stats.usersAhead} ahead`}
                </div>
                <div className="text-sm font-bold text-accent-teal">
                  {stats.percentile !== null && `Top ${stats.percentile}%`}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="p-5 border-b border-glass-border flex items-center justify-between bg-bg-surface-hover/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-sm font-bold text-text-secondary uppercase tracking-widest">
              <Users className="w-4 h-4 text-accent-purple" />
              <span>{leaderboard.length} competitors</span>
            </div>
            {filter === 'top10' && (
              <Badge variant="default">Top 10</Badge>
            )}
          </div>
          
          <div className="divide-y divide-glass-border">
            {leaderboard.map((entry) => {
              const isCurrentUser = currentUserRank?.id === entry.id
              const relativePosition = currentUserRank && !isCurrentUser 
                ? getRelativePosition(currentUserRank.rank, entry.rank)
                : undefined

              return (
                <div key={entry.id} className="transition-colors hover:bg-bg-surface/50">
                  <LeaderboardRow
                    rank={entry.rank}
                    full_name={entry.full_name}
                    avatar_slug={entry.avatar_slug}
                    xp={entry.xp}
                    backlog_count={entry.backlog_count}
                    relative={relativePosition}
                    isCurrentUser={isCurrentUser}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <Trophy className="w-20 h-20 mx-auto mb-6 text-text-muted opacity-20" />
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              No rankings yet
            </h3>
            <p className="text-text-secondary">
              Be the first to complete tasks and claim the top spot!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
