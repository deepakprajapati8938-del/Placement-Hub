import React from 'react'
import { motion } from 'framer-motion'
import { Avatar } from './Avatar'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface LeaderboardRowProps {
  rank: number
  full_name: string
  avatar_slug: string
  xp: number
  backlog_count: number
  relative?: number
  isCurrentUser?: boolean
  className?: string
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  full_name,
  avatar_slug,
  xp,
  backlog_count,
  relative,
  isCurrentUser = false,
  className
}) => {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 py-3 px-4 hover:bg-bg-surface-hover transition-all duration-200 rounded-lg",
        isCurrentUser && "bg-accent-purple/10 border border-glass-border-purple shadow-sm shadow-accent-purple/5",
        className
      )}
      whileHover={{ y: -1 }}
      layout
    >
      {/* Rank */}
      <div className="w-10 text-center">
        <span className={cn(
          "font-mono font-bold text-lg",
          rank <= 3 ? "text-accent-purple" : "text-text-muted"
        )}>
          #{rank}
        </span>
      </div>
      
      {/* Avatar + Name */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar slug={avatar_slug} size="md" className="border border-glass-border" />
        <div className="min-w-0">
          <p className="font-bold text-text-primary truncate">
            {full_name}
            {isCurrentUser && <span className="text-accent-purple font-normal ml-1"> (You)</span>}
          </p>
          {relative !== undefined && (
            <p className="text-xs text-text-secondary font-medium">
              {relative > 0 ? `+${relative} to catch` : `${Math.abs(relative)} ahead`}
            </p>
          )}
        </div>
      </div>
      
      {/* XP Bar */}
      <div className="hidden md:block w-40">
        <div className="h-1.5 bg-glass-border rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-accent-purple-strong transition-all duration-500 ease-out shadow-[0_0_10px_rgba(139,92,246,0.3)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((xp / 200) * 100, 100)}%` }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5">
           <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Level Progress</p>
           <p className="text-xs text-accent-purple font-mono font-bold">{xp} XP</p>
        </div>
      </div>
      
      {/* Backlog Count */}
      <div className="text-right ml-4">
        {backlog_count > 0 ? (
          <Badge variant="danger" className="text-[10px] px-2 py-0.5">🔴 {backlog_count}</Badge>
        ) : (
          <div className="w-6 h-6 rounded-full bg-accent-teal/10 flex items-center justify-center border border-glass-border-teal">
            <span className="text-xs text-accent-teal font-bold">✓</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
