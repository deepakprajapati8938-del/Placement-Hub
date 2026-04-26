'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Map, Calendar, Target, BookOpen } from 'lucide-react'
import { RoadmapNode } from '@/components/features/RoadmapNode'
import { Button } from '@/components/ui/Button'
import { CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface RoadmapPhase {
  id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  status: 'completed' | 'in-progress' | 'upcoming'
  tasks?: string[]
  notes?: string[]
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  const fetchRoadmap = useCallback(async () => {
    try {
      const response = await fetch('/roadmap.json')
      const data = await response.json()
      setRoadmap(data.phases || [])
    } catch (error) {
      console.error('Error fetching roadmap:', error)
      // Fallback roadmap data
      setRoadmap([
        {
          id: '1',
          title: 'Foundation',
          description: 'Build strong fundamentals in programming, data structures, and algorithms',
          status: 'completed',
          start_date: '2024-01-01',
          end_date: '2024-02-28',
          tasks: ['task-1', 'task-2', 'task-3'],
          notes: ['note-1']
        },
        {
          id: '2',
          title: 'Core Topics',
          description: 'Master key concepts like OOP, databases, and system design',
          status: 'in-progress',
          start_date: '2024-03-01',
          end_date: '2024-04-30',
          tasks: ['task-4', 'task-5'],
          notes: ['note-2', 'note-3']
        },
        {
          id: '3',
          title: 'Advanced Topics',
          description: 'Learn advanced algorithms, distributed systems, and performance optimization',
          status: 'upcoming',
          start_date: '2024-05-01',
          end_date: '2024-06-30',
          tasks: ['task-6', 'task-7'],
          notes: []
        },
        {
          id: '4',
          title: 'Interview Prep',
          description: 'Practice coding interviews, behavioral questions, and mock interviews',
          status: 'upcoming',
          start_date: '2024-07-01',
          end_date: '2024-08-31',
          tasks: ['task-8', 'task-9'],
          notes: ['note-4']
        },
        {
          id: '5',
          title: 'Company Specific',
          description: 'Research target companies and prepare for their specific interview processes',
          status: 'upcoming',
          start_date: '2024-09-01',
          end_date: '2024-10-31',
          tasks: ['task-10'],
          notes: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoadmap()
    }, 0)
    return () => clearTimeout(timer)
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">Loading roadmap...</p>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12 pb-24 md:pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Map className="w-10 h-10 text-accent-purple shadow-lg shadow-accent-purple/20" />
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">
              Learning Roadmap
            </h1>
          </div>
          <p className="text-text-secondary text-lg">
            Your structured path to placement success
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card text-center p-4"
          >
            <div className="text-2xl font-bold text-accent-teal">{stats.completed}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Completed</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card text-center p-4"
          >
            <div className="text-2xl font-bold text-accent-purple">{stats.inProgress}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted">In Progress</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card text-center p-4"
          >
            <div className="text-2xl font-bold text-accent-pink">{stats.upcoming}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Upcoming</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card text-center p-4"
          >
            <div className="text-2xl font-bold text-accent-blue">{stats.totalTasks}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Tasks</div>
          </motion.div>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-8 relative z-10">
          {roadmap.map((phase, index) => (
            <RoadmapNode
              key={phase.id}
              phase={phase}
              isLast={index === roadmap.length - 1}
            />
          ))}
        </div>

        {/* Phase Details Modal */}
        {selectedPhase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-bg-base/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhase(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="glass-card glass-card--purple max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-accent-purple/20"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b border-glass-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-text-primary">
                    {roadmap.find(p => p.id === selectedPhase)?.title}
                  </h3>
                  <button
                    onClick={() => setSelectedPhase(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bg-surface-hover transition-colors text-text-secondary"
                  >
                    ×
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {(() => {
                  const phase = roadmap.find(p => p.id === selectedPhase)
                  if (!phase) return null

                  return (
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-accent-purple mb-3">Description</h4>
                        <p className="text-text-secondary leading-relaxed">{phase.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-accent-teal mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Timeline
                          </h4>
                          <div className="space-y-2 text-sm text-text-secondary font-medium">
                            <div className="flex justify-between">
                              <span className="text-text-muted">Start:</span>
                              <span>{new Date(phase.start_date || '').toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">End:</span>
                              <span>{new Date(phase.end_date || '').toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-accent-blue mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Resources
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="default" className="px-3 py-1">{phase.tasks?.length || 0} Tasks</Badge>
                            <Badge variant="secondary" className="px-3 py-1">{phase.notes?.length || 0} Notes</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-glass-border">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-accent-pink mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Quick Actions
                        </h4>
                        <div className="flex gap-3">
                          <Button variant="primary" size="sm" className="flex-1">
                            View Tasks
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Notes
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {roadmap.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <Map className="w-20 h-20 mx-auto mb-6 text-text-muted opacity-20" />
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              Roadmap coming soon
            </h3>
            <p className="text-text-secondary">
              We&apos;re preparing your personalized learning path. Check back soon!
            </p>
          </motion.div>
        )}
      </div>
    </div>

  )
}
