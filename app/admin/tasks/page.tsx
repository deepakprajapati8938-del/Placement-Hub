'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Calendar, Tag, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/db/types'

type Task = Database['public']['Tables']['tasks']['Row']

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: [] as string[],
    roadmap_phase: ''
  })

  const fetchTasks = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchTasks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const supabase = createClient()
      
      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline || null,
            priority: formData.priority,
            tags: formData.tags,
            roadmap_phase: formData.roadmap_phase || null
          })
          .eq('id', editingTask.id)

        if (error) throw error
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert({
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline || null,
            priority: formData.priority,
            tags: formData.tags,
            roadmap_phase: formData.roadmap_phase || null
          })

        if (error) throw error
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        tags: [],
        roadmap_phase: ''
      })
      setEditingTask(null)
      setShowForm(false)
      
      await fetchTasks()
    } catch (error: any) {
      console.error('Error saving task:', error)
      alert(error.message || 'Failed to save task')
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline || '',
      priority: task.priority,
      tags: task.tags || [],
      roadmap_phase: task.roadmap_phase || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      
      await fetchTasks()
    } catch (error: any) {
      console.error('Error deleting task:', error)
      alert(error.message || 'Failed to delete task')
    }
  }

  const handleAddTag = () => {
    const tagInput = document.getElementById('tag-input') as HTMLInputElement
    if (tagInput && tagInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.value.trim()]
      }))
      tagInput.value = ''
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">Loading tasks...</p>
        </div>
      </div>
    )
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
              Task Management
            </h1>
            <p className="text-text-muted">
              Create and manage placement preparation tasks
            </p>
          </div>
          
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </motion.div>

        {/* Task Form Modal */}
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
                    {editingTask ? 'Edit Task' : 'Create New Task'}
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
                    label="Task Title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter task description (optional)"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input min-h-[100px] resize-none"
                    />
                  </div>

                  <Input
                    type="datetime-local"
                    label="Deadline"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  />

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="default" className="flex items-center gap-1">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-text-muted hover:text-danger transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="tag-input"
                        type="text"
                        placeholder="Add tag and press Enter"
                        className="input flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        variant="outline"
                        size="sm"
                      >
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Input
                    label="Roadmap Phase"
                    placeholder="e.g., Foundation, Core Topics"
                    value={formData.roadmap_phase}
                    onChange={(e) => setFormData(prev => ({ ...prev, roadmap_phase: e.target.value }))}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!formData.title}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingTask ? 'Update Task' : 'Create Task'}
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

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-text mb-2">
                No tasks created yet
              </h3>
              <p className="text-sm text-text-muted">
                Create your first task to get started with the placement preparation roadmap
              </p>
            </motion.div>
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-text dark:text-text-dark truncate">
                            {task.title}
                          </h3>
                          <Badge variant={
                            task.priority === 'high' ? 'danger' :
                            task.priority === 'medium' ? 'warning' : 'default'
                          }>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-text-muted mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          {task.deadline && (
                            <span>
                              Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                          {task.roadmap_phase && (
                            <span>
                              Phase: {task.roadmap_phase}
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-1">
                              {task.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(task)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
