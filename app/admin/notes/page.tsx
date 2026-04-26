'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, FileText, ExternalLink, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/db/types'

type Note = Database['public']['Tables']['notes']['Row']

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [phases, setPhases] = useState<Database['public']['Tables']['roadmap_phases']['Row'][]>([])
  const [formData, setFormData] = useState({
    title: '',
    resource_url: '',
    file_url: '',
    tags: [] as string[],
    target_stage: '',
    phase_id: ''
  })
  const [fileUploading, setFileUploading] = useState(false)

  useEffect(() => {
    fetchNotes()
    fetchPhases()
  }, [])

  const fetchPhases = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('roadmap_phases').select('id, title').order('order')
      setPhases(data || [])
    } catch (error) {
      console.error('Error fetching phases:', error)
    }
  }

  const fetchNotes = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const supabase = createClient()
      
      const noteData = {
        title: formData.title,
        resource_url: formData.resource_url || null,
        file_url: formData.file_url || null,
        tags: formData.tags,
        target_stage: formData.target_stage || null,
        phase_id: formData.phase_id || null
      }

      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', editingNote.id)

        if (error) throw error
      } else {
        // Create new note
        const { error } = await supabase
          .from('notes')
          .insert(noteData)

        if (error) throw error
      }

      // Reset form
      setFormData({
        title: '',
        resource_url: '',
        file_url: '',
        tags: [],
        target_stage: '',
        phase_id: ''
      })
      setEditingNote(null)
      setShowForm(false)
      
      await fetchNotes()
    } catch (error: any) {
      console.error('Error saving note:', error)
      alert(error.message || 'Failed to save note')
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      resource_url: note.resource_url || '',
      file_url: note.file_url || '',
      tags: note.tags || [],
      target_stage: note.target_stage || '',
      phase_id: note.phase_id || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
      
      await fetchNotes()
    } catch (error: any) {
      console.error('Error deleting note:', error)
      alert(error.message || 'Failed to delete note')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileUploading(true)
    
    try {
      // In a real app, you'd upload to Supabase Storage
      // For now, simulate upload and return a placeholder URL
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          file_url: `https://placeholder.com/files/${file.name}`
        }))
        setFileUploading(false)
      }, 1000)
    } catch (error) {
      console.error('Error uploading file:', error)
      setFileUploading(false)
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
          <p className="mt-4 text-text-muted">Loading notes...</p>
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
              Note Management
            </h1>
            <p className="text-text-muted">
              Upload and manage study materials for students
            </p>
          </div>
          
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </Button>
        </motion.div>

        {/* Note Form Modal */}
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
                        {editingNote ? 'Edit Note' : 'Create New Note'}
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
                    label="Note Title"
                    placeholder="Enter note title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Resource URL (optional)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com/resource"
                      value={formData.resource_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, resource_url: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Upload File (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={handleFileUpload}
                        className="input flex-1"
                      />
                      {fileUploading && (
                        <div className="text-sm text-text-muted">Uploading...</div>
                      )}
                    </div>
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
                        Add Tag
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Legacy Target Stage"
                      placeholder="e.g., Foundation"
                      value={formData.target_stage}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_stage: e.target.value }))}
                    />
                    <div>
                      <label className="text-sm font-medium leading-none mb-2 block">
                        Linked Roadmap Phase
                      </label>
                      <select
                        value={formData.phase_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, phase_id: e.target.value }))}
                        className="input"
                      >
                        <option value="">No Phase</option>
                        {phases.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!formData.title}
                    >
                      {editingNote ? 'Update Note' : 'Create Note'}
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

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-text mb-2">
                No notes created yet
              </h3>
              <p className="text-sm text-text-muted">
                Create your first study note to help students prepare for placements
              </p>
            </motion.div>
          ) : (
            notes.map((note, index) => (
              <motion.div
                key={note.id}
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
                            {note.title}
                          </h3>
                          <Badge variant="default">{note.view_count} views</Badge>
                        </div>
                        
                        {note.target_stage && (
                          <div className="mb-2">
                            <Badge variant="secondary">{note.target_stage}</Badge>
                          </div>
                        )}
                        
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex gap-1 mb-2">
                            {note.tags.map(tag => (
                              <Badge key={tag} variant="default" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-sm text-text-muted mb-3">
                          Uploaded {new Date(note.uploaded_at).toLocaleDateString()}
                        </div>

                        {/* Resource Links */}
                        {(note.resource_url || note.file_url) && (
                          <div className="space-y-2">
                            {note.resource_url && (
                              <a
                                href={note.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open Resource
                              </a>
                            )}
                            
                            {note.file_url && (
                              <a
                                href={note.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                View File
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(note)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(note.id)}
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
