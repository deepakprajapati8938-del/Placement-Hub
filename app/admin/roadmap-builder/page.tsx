'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, Download, X, Edit, Trash2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

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

interface RoadmapData {
  phases: RoadmapPhase[]
}

export default function RoadmapBuilderPage() {
  const [roadmap, setRoadmap] = useState<RoadmapData>({ phases: [] })
  const [showForm, setShowForm] = useState(false)
  const [editingPhase, setEditingPhase] = useState<RoadmapPhase | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'upcoming' as 'completed' | 'in-progress' | 'upcoming',
    tasks: [] as string[],
    notes: [] as string[]
  })

  const fetchRoadmap = useCallback(async () => {
    try {
      const response = await fetch('/roadmap.json')
      const data = await response.json()
      setRoadmap(data || { phases: [] })
    } catch (error) {
      console.error('Error fetching roadmap:', error)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoadmap()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchRoadmap])

  const saveRoadmap = async () => {
    try {
      const response = await fetch('/api/roadmap/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roadmap)
      })

      if (!response.ok) {
        throw new Error('Failed to save roadmap')
      }

      alert('Roadmap saved successfully!')
    } catch (error) {
      console.error('Error saving roadmap:', error)
      alert('Failed to save roadmap')
    }
  }

  const downloadRoadmap = () => {
    const dataStr = JSON.stringify(roadmap, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'roadmap.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPhase) {
      // Update existing phase
      setRoadmap(prev => ({
        phases: prev.phases.map(phase => 
          phase.id === editingPhase.id 
            ? { ...formData, id: editingPhase.id }
            : phase
        )
      }))
    } else {
      // Create new phase
      const newPhase: RoadmapPhase = {
        ...formData,
        id: Date.now().toString()
      }
      setRoadmap(prev => ({
        phases: [...prev.phases, newPhase]
      }))
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'upcoming',
      tasks: [],
      notes: []
    })
    setEditingPhase(null)
    setShowForm(false)
  }

  const handleEdit = (phase: RoadmapPhase) => {
    setEditingPhase(phase)
    setFormData({
      title: phase.title,
      description: phase.description || '',
      start_date: phase.start_date || '',
      end_date: phase.end_date || '',
      status: phase.status,
      tasks: phase.tasks || [],
      notes: phase.notes || []
    })
    setShowForm(true)
  }

  const handleDelete = (phaseId: string) => {
    if (!confirm('Are you sure you want to delete this phase?')) return

    setRoadmap(prev => ({
      phases: prev.phases.filter(phase => phase.id !== phaseId)
    }))
  }

  const handleAddItem = (type: 'tasks' | 'notes') => {
    const input = document.getElementById(`${type}-input`) as HTMLInputElement
    if (input && input.value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], input.value.trim()]
      }))
      input.value = ''
    }
  }

  const handleRemoveItem = (type: 'tasks' | 'notes', itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== itemToRemove)
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-text dark:text-text-dark">
              Roadmap Builder
            </h1>
            <p className="text-text-muted">
              Create and manage the learning roadmap for students
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={saveRoadmap}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Roadmap
            </Button>
            <Button
              onClick={downloadRoadmap}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </Button>
          </div>
        </motion.div>

        {/* Phase Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-text dark:text-text-dark">
                        {editingPhase ? 'Edit Phase' : 'Create New Phase'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-text-muted hover:text-text transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Phase Title"
                    placeholder="e.g., Foundation"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe what students will learn in this phase"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input min-h-[100px] resize-none"
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

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Status
                    </label>
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

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Linked Tasks (comma-separated)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        id="tasks-input"
                        type="text"
                        placeholder="task-1, task-2"
                        value={formData.tasks.join(', ')}
                        onChange={(e) => setFormData(prev => ({ ...prev, tasks: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                        className="input flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddItem('tasks')}
                        variant="outline"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tasks.map(task => (
                        <Badge key={task} variant="default" className="flex items-center gap-1">
                          {task}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('tasks', task)}
                            className="ml-1 text-text-muted hover:text-danger transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Linked Notes (comma-separated)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        id="notes-input"
                        type="text"
                        placeholder="note-1, note-2"
                        value={formData.notes.join(', ')}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value.split(',').map(n => n.trim()).filter(Boolean) }))}
                        className="input flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddItem('notes')}
                        variant="outline"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.notes.map(note => (
                        <Badge key={note} variant="secondary" className="flex items-center gap-1">
                          {note}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('notes', note)}
                            className="ml-1 text-text-muted hover:text-danger transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!formData.title}
                    >
                      {editingPhase ? 'Update Phase' : 'Create Phase'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </motion.div>
          </motion.div>
        )}

        {/* Roadmap Preview */}
        <div className="space-y-6">
          {roadmap.phases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-text mb-2">
                No phases created yet
              </h3>
              <p className="text-sm text-text-muted">
                Create your first phase to start building the roadmap
              </p>
            </motion.div>
          ) : (
            roadmap.phases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text dark:text-text-dark mb-2">
                          {phase.title}
                        </h3>
                        {phase.description && (
                          <p className="text-sm text-text-muted mb-3">
                            {phase.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <Badge variant={
                            phase.status === 'completed' ? 'success' :
                            phase.status === 'in-progress' ? 'warning' : 'default'
                          }>
                            {phase.status}
                          </Badge>
                          {phase.start_date && (
                            <span>
                              Starts: {new Date(phase.start_date).toLocaleDateString()}
                            </span>
                          )}
                          {phase.end_date && (
                            <span>
                              Ends: {new Date(phase.end_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(phase)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(phase.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Linked Items */}
                    <div className="space-y-2">
                      {phase.tasks && phase.tasks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-text mb-1">Tasks ({phase.tasks.length})</h4>
                          <div className="flex flex-wrap gap-1">
                            {phase.tasks.map(task => (
                              <Badge key={task} variant="default" className="text-xs">
                                {task}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {phase.notes && phase.notes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-text mb-1">Notes ({phase.notes.length})</h4>
                          <div className="flex flex-wrap gap-1">
                            {phase.notes.map(note => (
                              <Badge key={note} variant="secondary" className="text-xs">
                                {note}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Phase Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-full w-14 h-14 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
