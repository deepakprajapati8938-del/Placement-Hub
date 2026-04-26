import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoadmapNodeProps {
  phase: {
    id: string
    title: string
    description?: string
    start_date?: string
    end_date?: string
    status: 'completed' | 'in-progress' | 'upcoming'
    tasks?: string[]
    notes?: string[]
  }
  isLast?: boolean
  className?: string
}

export const RoadmapNode: React.FC<RoadmapNodeProps> = ({
  phase,
  isLast = false,
  className
}) => {
  const statusColors = {
    completed: 'text-accent-teal',
    'in-progress': 'text-accent-purple',
    upcoming: 'text-text-muted'
  }

  const statusIcons = {
    completed: <CheckCircle className="w-5 h-5" />,
    'in-progress': <Circle className="w-5 h-5 fill-accent-purple/20" />,
    upcoming: <Circle className="w-5 h-5" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("flex gap-6", className)}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300",
          phase.status === 'completed' ? 'bg-accent-teal/10 border-accent-teal shadow-[0_0_15px_rgba(45,212,191,0.2)] text-accent-teal' :
          phase.status === 'in-progress' ? 'bg-accent-purple/10 border-accent-purple shadow-[0_0_15px_rgba(139,92,246,0.2)] text-accent-purple animate-pulse' :
          'bg-bg-surface border-glass-border text-text-muted'
        )}>
          {statusIcons[phase.status]}
        </div>
        {!isLast && (
          <div className={cn(
            "w-0.5 h-full mt-2 rounded-full",
            phase.status === 'completed' ? "bg-accent-teal/30" : "bg-glass-border"
          )} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-12">
        <div className={cn(
          "glass-card group hover:scale-[1.01] transition-all",
          phase.status === 'in-progress' && "glass-card--purple ring-1 ring-accent-purple/20"
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-purple transition-colors">
                {phase.title}
              </h3>
              {phase.description && (
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  {phase.description}
                </p>
              )}
            </div>
            <div className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border",
              phase.status === 'completed' ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/20' :
              phase.status === 'in-progress' ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20' :
              'bg-bg-surface text-text-muted border-glass-border'
            )}>
              {phase.status.replace('-', ' ')}
            </div>
          </div>

          {/* Dates */}
          {(phase.start_date || phase.end_date) && (
            <div className="flex items-center gap-3 mt-5 text-xs font-bold text-text-muted uppercase tracking-wider">
              {phase.start_date && (
                <span>{new Date(phase.start_date).toLocaleDateString()}</span>
              )}
              {phase.start_date && phase.end_date && (
                <span className="opacity-30">•</span>
              )}
              {phase.end_date && (
                <span>{new Date(phase.end_date).toLocaleDateString()}</span>
              )}
            </div>
          )}

          {/* Tasks and Notes Count */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-glass-border">
            {phase.tasks && phase.tasks.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                <span className="text-xs font-bold text-text-secondary">
                  {phase.tasks.length} task{phase.tasks.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {phase.notes && phase.notes.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                <span className="text-xs font-bold text-text-secondary">
                  {phase.notes.length} note{phase.notes.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
