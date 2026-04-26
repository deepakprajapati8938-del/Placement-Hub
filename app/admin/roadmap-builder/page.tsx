'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Save, Download, X, Edit, Trash2, 
  Calendar, GripVertical, CheckCircle, Clock,
  BookOpen, Target, Link as LinkIcon, FileText,
  AlertCircle, ChevronRight, Layout
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/db/types'

type Phase = Database['public']['Tables']['roadmap_phases']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Note = Database['public']['Tables']['notes']['Row']

interface PhaseWithItems extends Phase {
  tasks: Task[]
  notes: Note[]
}

export default function RoadmapBuilderPage() {
  const [phases, setPhases] = useState<PhaseWithItems[]>([])
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([])
  const [unassignedNotes, setUnassignedNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showPhaseForm, setShowPhaseForm] = useState(false)
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'upcoming' as 'completed' | 'in-progress' | 'upcoming',
    order: 0
  })

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient()
      
      // Fetch phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('roadmap_phases')
        .select('*')
        .order('order', { ascending: true })

      if (phasesError) throw phasesError

      // Fetch all tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')

      if (tasksError) throw tasksError

      // Fetch all notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')

      if (notesError) throw notesError

      // Group tasks and notes by phase
      const phasesWithItems = (phasesData || []).map(phase => ({
        ...phase,
        tasks: (tasksData || []).filter(t => t.phase_id === phase.id),
        notes: (notesData || []).filter(n => n.phase_id === phase.id)
      }))

      setPhases(phasesWithItems)
      setUnassignedTasks((tasksData || []).filter(t => !t.phase_id))
      setUnassignedNotes((notesData || []).filter(n => !n.phase_id))
    } catch (error) {
      console.error('Error fetching roadmap data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePhaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const supabase = createClient()
      
      if (editingPhase) {
        const { error } = await supabase
          .from('roadmap_phases')
          .update({
            title: formData.title,
            description: formData.description,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            status: formData.status,
            order: formData.order
          })
          .eq('id', editingPhase.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('roadmap_phases')
          .insert({
            title: formData.title,
            description: formData.description,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            status: formData.status,
            order: phases.length
          })

        if (error) throw error
      }

      setEditingPhase(null)
      setShowPhaseForm(false)
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'upcoming',
        order: 0
      })
      await fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePhase = async (id: string) => {
    if (!confirm('Are you sure? This will unassign all tasks/notes in this phase.')) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('roadmap_phases')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const toggleItemAssignment = async (type: 'tasks' | 'notes', itemId: string, phaseId: string | null) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from(type)
        .update({ phase_id: phaseId })
        .eq('id', itemId)

      if (error) throw error
      await fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary font-medium animate-pulse">Building Roadmap...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base pb-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                <Layout className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Roadmap Builder</h1>
            </div>
            <p className="text-text-secondary">Orchestrate the learning journey and study materials</p>
          </motion.div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowPhaseForm(true)}
              className="btn-aurora"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Phase
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Roadmap Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Active Path
            </h2>

            {phases.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent text-center py-16">
                <div className="w-16 h-16 rounded-full bg-bg-surface-hover flex items-center justify-center mx-auto mb-4 text-text-muted">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">No Phases Yet</h3>
                <p className="text-text-secondary mb-6 max-w-xs mx-auto">Start by creating your first phase to structure the roadmap.</p>
                <Button onClick={() => setShowPhaseForm(true)} variant="outline">Create First Phase</Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {phases.map((phase, idx) => (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="glass-card overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={
                                phase.status === 'completed' ? 'success' :
                                phase.status === 'in-progress' ? 'warning' : 'default'
                              } className="text-[10px] uppercase">
                                {phase.status}
                              </Badge>
                              <span className="text-xs font-bold text-text-muted">Phase {idx + 1}</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">{phase.title}</h3>
                            {phase.description && (
                              <p className="text-sm text-text-secondary mt-1 line-clamp-2">{phase.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setEditingPhase(phase)
                                setFormData({
                                  title: phase.title,
                                  description: phase.description || '',
                                  start_date: phase.start_date ? phase.start_date.split('T')[0] : '',
                                  end_date: phase.end_date ? phase.end_date.split('T')[0] : '',
                                  status: phase.status,
                                  order: phase.order
                                })
                                setShowPhaseForm(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeletePhase(phase.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-glass-border">
                          {/* Linked Tasks */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-accent-teal" />
                              Linked Tasks ({phase.tasks.length})
                            </h4>
                            <div className="space-y-2">
                              {phase.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-bg-surface-hover/50 text-xs font-medium group/item">
                                  <span className="truncate pr-2">{task.title}</span>
                                  <button 
                                    onClick={() => toggleItemAssignment('tasks', task.id, null)}
                                    className="text-text-muted hover:text-danger opacity-0 group-hover/item:opacity-100 transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {phase.tasks.length === 0 && <p className="text-[10px] italic text-text-muted">No tasks assigned</p>}
                            </div>
                          </div>

                          {/* Linked Notes */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                              <BookOpen className="w-3 h-3 text-accent-blue" />
                              Linked Notes ({phase.notes.length})
                            </h4>
                            <div className="space-y-2">
                              {phase.notes.map(note => (
                                <div key={note.id} className="flex items-center justify-between p-2 rounded-lg bg-bg-surface-hover/50 text-xs font-medium group/item">
                                  <span className="truncate pr-2">{note.title}</span>
                                  <button 
                                    onClick={() => toggleItemAssignment('notes', note.id, null)}
                                    className="text-text-muted hover:text-danger opacity-0 group-hover/item:opacity-100 transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {phase.notes.length === 0 && <p className="text-[10px] italic text-text-muted">No notes assigned</p>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Unassigned Items Inventory */}
          <div className="space-y-8">
            <div className="sticky top-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
                <Download className="w-4 h-4 rotate-180" />
                Inventory
              </h2>

              <div className="space-y-6">
                {/* Unassigned Tasks */}
                <Card className="glass-card glass-card--teal">
                  <CardHeader className="pb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent-teal" />
                      Unassigned Tasks
                      <Badge variant="default" className="ml-auto">{unassignedTasks.length}</Badge>
                    </h3>
                  </CardHeader>
                  <CardContent className="max-h-[300px] overflow-y-auto space-y-2 thin-scrollbar">
                    {unassignedTasks.map(task => (
                      <div key={task.id} className="p-3 rounded-xl bg-bg-surface-hover/30 border border-glass-border hover:border-accent-teal/30 transition-all">
                        <p className="text-xs font-bold text-text-primary mb-2 truncate">{task.title}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {phases.map(phase => (
                            <button
                              key={phase.id}
                              onClick={() => toggleItemAssignment('tasks', task.id, phase.id)}
                              className="text-[9px] font-bold px-2 py-0.5 rounded bg-accent-teal/10 text-accent-teal hover:bg-accent-teal hover:text-white transition-colors border border-accent-teal/20"
                            >
                              Add to {phase.title.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {unassignedTasks.length === 0 && (
                      <div className="text-center py-6 opacity-40">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">All tasks assigned</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Unassigned Notes */}
                <Card className="glass-card glass-card--purple">
                  <CardHeader className="pb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent-purple" />
                      Unassigned Notes
                      <Badge variant="secondary" className="ml-auto">{unassignedNotes.length}</Badge>
                    </h3>
                  </CardHeader>
                  <CardContent className="max-h-[300px] overflow-y-auto space-y-2 thin-scrollbar">
                    {unassignedNotes.map(note => (
                      <div key={note.id} className="p-3 rounded-xl bg-bg-surface-hover/30 border border-glass-border hover:border-accent-purple/30 transition-all">
                        <p className="text-xs font-bold text-text-primary mb-2 truncate">{note.title}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {phases.map(phase => (
                            <button
                              key={phase.id}
                              onClick={() => toggleItemAssignment('notes', note.id, phase.id)}
                              className="text-[9px] font-bold px-2 py-0.5 rounded bg-accent-purple/10 text-accent-purple hover:bg-accent-purple hover:text-white transition-colors border border-accent-purple/20"
                            >
                              Add to {phase.title.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {unassignedNotes.length === 0 && (
                      <div className="text-center py-6 opacity-40">
                        <BookOpen className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">All notes assigned</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Form Modal */}
      <AnimatePresence>
        {showPhaseForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
              onClick={() => setShowPhaseForm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-card glass-card--purple overflow-hidden"
            >
              <CardHeader className="pb-4 border-b border-glass-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-text-primary">
                    {editingPhase ? 'Edit Phase' : 'Create New Phase'}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => setShowPhaseForm(false)} className="rounded-full w-8 h-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePhaseSubmit} className="space-y-6">
                  <Input
                    label="Phase Title"
                    placeholder="e.g., Programming Foundations"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Description</label>
                    <textarea
                      className="input min-h-[100px] py-3 px-4 resize-none"
                      placeholder="What will students focus on during this phase?"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Start Date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                    <Input
                      type="date"
                      label="End Date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="input"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <Input
                      type="number"
                      label="Display Order"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 btn-aurora"
                      loading={saving}
                      disabled={!formData.title}
                    >
                      {editingPhase ? 'Update Phase' : 'Create Phase'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
