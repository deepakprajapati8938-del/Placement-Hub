'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Calendar, Target, BookOpen, ExternalLink, FileText, ChevronRight, CheckCircle, Clock } from 'lucide-react'
import { RoadmapNode } from '@/components/features/RoadmapNode'
import { Button } from '@/components/ui/Button'
import { CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/db/types'

type Phase = Database['public']['Tables']['roadmap_phases']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Note = Database['public']['Tables']['notes']['Row']

interface PhaseWithItems extends Phase {
  tasks: Task[]
  notes: Note[]
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<PhaseWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)

  const fetchRoadmap = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Fetch phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('roadmap_phases')
        .select('*')
        .order('order', { ascending: true })

      if (phasesError) throw phasesError

      // Fetch all tasks and notes linked to phases
      const { data: tasksData } = await supabase.from('tasks').select('*').not('phase_id', 'is', null)
      const { data: notesData } = await supabase.from('notes').select('*').not('phase_id', 'is', null)

      const phasesWithItems = (phasesData || []).map(phase => ({
        ...phase,
        tasks: (tasksData || []).filter(t => t.phase_id === phase.id),
        notes: (notesData || []).filter(n => n.phase_id === phase.id)
      }))

      setRoadmap(phasesWithItems)
    } catch (error) {
      console.error('Error fetching roadmap:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoadmap()
  }, [fetchRoadmap])

  const getStats = () => {
    const completed = roadmap.filter(phase => phase.status === 'completed').length
    const inProgress = roadmap.filter(phase => phase.status === 'in-progress').length
    const upcoming = roadmap.filter(phase => phase.status === 'upcoming').length
    const totalTasks = roadmap.reduce((sum, phase) => sum + (phase.tasks?.length || 0), 0)
    const totalNotes = roadmap.reduce((sum, phase) => sum + (phase.notes?.length || 0), 0)

    return { completed, inProgress, upcoming, totalTasks, totalNotes }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary font-medium animate-pulse">Loading Roadmap...</p>
        </div>
      </div>
    )
  }

  const stats = getStats()
  const selectedPhase = roadmap.find(p => p.id === selectedPhaseId)

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 py-12 pb-24 md:pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
              <Map className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">
              Learning Path
            </h1>
          </div>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            A meticulously structured journey designed to take you from fundamentals to placement success.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Completed', value: stats.completed, color: 'text-accent-teal', bg: 'bg-accent-teal/5' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-accent-purple', bg: 'bg-accent-purple/5' },
            { label: 'Upcoming', value: stats.upcoming, color: 'text-accent-pink', bg: 'bg-accent-pink/5' },
            { label: 'Resources', value: stats.totalTasks + stats.totalNotes, color: 'text-accent-blue', bg: 'bg-accent-blue/5' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-card text-center p-6 border-none shadow-xl shadow-black/5 ${stat.bg}`}
            >
              <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-4 relative">
          <div className="absolute left-6 top-8 bottom-8 w-px bg-glass-border hidden md:block" />
          {roadmap.map((phase, index) => (
            <div 
              key={phase.id} 
              onClick={() => setSelectedPhaseId(phase.id)}
              className="cursor-pointer"
            >
              <RoadmapNode
                phase={{
                  ...phase,
                  tasks: phase.tasks.map(t => t.id), // Compat with existing node prop
                  notes: phase.notes.map(n => n.id)
                }}
                isLast={index === roadmap.length - 1}
              />
            </div>
          ))}
        </div>

        {/* Phase Details Modal */}
        <AnimatePresence>
          {selectedPhaseId && selectedPhase && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-bg-base/80 backdrop-blur-md"
                onClick={() => setSelectedPhaseId(null)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-2xl glass-card glass-card--purple overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader className="pb-4 border-b border-glass-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant={
                        selectedPhase.status === 'completed' ? 'success' :
                        selectedPhase.status === 'in-progress' ? 'warning' : 'default'
                      } className="mb-2 text-[10px] uppercase tracking-wider">
                        {selectedPhase.status}
                      </Badge>
                      <h3 className="text-2xl font-bold text-text-primary">
                        {selectedPhase.title}
                      </h3>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPhaseId(null)} className="rounded-full w-10 h-10 p-0">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-8 overflow-y-auto max-h-[70vh]">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent-purple mb-3 flex items-center gap-2">
                      <BookOpen className="w-3 h-3" />
                      About this Phase
                    </h4>
                    <p className="text-text-secondary leading-relaxed">{selectedPhase.description || 'No description available for this phase.'}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent-teal mb-4 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Timeline
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-bg-surface-hover/30 border border-glass-border">
                          <span className="text-xs font-bold text-text-muted">START</span>
                          <span className="text-xs font-black text-text-primary">{selectedPhase.start_date ? new Date(selectedPhase.start_date).toLocaleDateString() : 'TBD'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-bg-surface-hover/30 border border-glass-border">
                          <span className="text-xs font-bold text-text-muted">END</span>
                          <span className="text-xs font-black text-text-primary">{selectedPhase.end_date ? new Date(selectedPhase.end_date).toLocaleDateString() : 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent-blue mb-4 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Quick Access
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="outline" className="justify-between group">
                          View Tasks
                          <Badge variant="default" className="ml-2">{selectedPhase.tasks.length}</Badge>
                        </Button>
                        <Button variant="outline" className="justify-between group">
                          View Notes
                          <Badge variant="secondary" className="ml-2">{selectedPhase.notes.length}</Badge>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Preview */}
                  {selectedPhase.tasks.length > 0 && (
                    <div className="pt-6 border-t border-glass-border">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent-teal mb-4 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        Core Tasks
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedPhase.tasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface-hover/30 border border-glass-border hover:border-accent-teal/30 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-bg-surface flex items-center justify-center text-text-muted group-hover:text-accent-teal transition-colors">
                                <Target className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-text-primary">{task.title}</h5>
                                <p className="text-[10px] text-text-muted">{task.priority.toUpperCase()} PRIORITY</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes Preview */}
                  {selectedPhase.notes.length > 0 && (
                    <div className="pt-6 border-t border-glass-border">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent-blue mb-4 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        Study Materials
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedPhase.notes.map(note => (
                          <div key={note.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface-hover/30 border border-glass-border hover:border-accent-blue/30 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-bg-surface flex items-center justify-center text-text-muted group-hover:text-accent-blue transition-colors">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-text-primary">{note.title}</h5>
                                <div className="flex gap-1 mt-1">
                                  {note.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] font-bold text-accent-blue uppercase tracking-tighter">#{tag}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {note.resource_url && <ExternalLink className="w-4 h-4 text-text-muted hover:text-accent-blue transition-colors" />}
                              <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {roadmap.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-24 h-24 rounded-full bg-bg-surface-hover flex items-center justify-center mx-auto mb-8 opacity-20">
               <Map className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              Roadmap being curated
            </h3>
            <p className="text-text-secondary max-w-sm mx-auto">
              Our admins are meticulously crafting your learning journey. Please check back later.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function X({ className, onClick }: { className?: string, onClick?: () => void }) {
  return (
    <svg 
      className={className} 
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  )
}
