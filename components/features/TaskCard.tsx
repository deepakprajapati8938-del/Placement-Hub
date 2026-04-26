import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatDeadline } from '@/lib/utils'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string | null
    deadline?: string | null
    priority: 'low' | 'medium' | 'high'
    tags?: string[]
    is_backlog?: boolean
    progress?: number
  }
  onMarkDone?: (taskId: string) => void
  onReschedule?: (taskId: string) => void
  showBacklogBadge?: boolean
  className?: string
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onMarkDone,
  onReschedule,
  showBacklogBadge = true,
  className
}) => {
  return (
    <Card hover className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {task.priority === 'high' && (
              <Badge variant="danger">🔴 High</Badge>
            )}
            <h3 className="font-semibold text-text dark:text-text-dark truncate">
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        {/* Avatar + XP hint */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="font-mono">+10 XP</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-text-muted mt-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDeadline(task.deadline || null)}
        </span>
        {task.tags && task.tags.map(tag => (
          <Badge key={tag} variant="default">#{tag}</Badge>
        ))}
      </div>

      {/* Progress (if applicable) */}
      {task.progress !== undefined && (
        <div className="space-y-1 mt-3">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span className="font-mono">{task.progress}%</span>
          </div>
          <div className="h-1.5 bg-border dark:bg-border-dark rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 mt-3 border-t border-border dark:border-border-dark">
        <Button 
          onClick={() => onMarkDone?.(task.id)}
          className="flex-1"
          size="sm"
        >
          <Check className="w-4 h-4 mr-2" /> Mark Done
        </Button>
        <Button 
          onClick={() => onReschedule?.(task.id)}
          variant="secondary"
          size="sm"
        >
          <Clock className="w-4 h-4" />
        </Button>
      </div>

      {/* Backlog Badge */}
      {showBacklogBadge && task.is_backlog && (
        <div className="absolute top-3 right-3">
          <Badge variant="danger" className="animate-pulse">🔴 Overdue</Badge>
        </div>
      )}
    </Card>
  )
}
