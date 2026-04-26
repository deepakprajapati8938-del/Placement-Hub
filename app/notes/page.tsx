'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, FileText, ExternalLink, Eye } from 'lucide-react'
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/db/types'

type Note = Database['public']['Tables']['notes']['Row']

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const stages = useMemo(() => {
    return [...new Set(notes.map(note => note.target_stage).filter(Boolean))] as string[]
  }, [notes])

  const tags = useMemo(() => {
    return [...new Set(notes.flatMap(note => note.tags || []).filter(Boolean))] as string[]
  }, [notes])

  const fetchNotes = useCallback(async () => {
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })

      // Apply filters
      if (selectedStage !== 'all') {
        query = query.eq('target_stage', selectedStage)
      }

      const { data, error } = await query

      if (error) throw error

      setNotes(data || [])
      
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedStage])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchNotes])

  const incrementViewCount = async (noteId: string) => {
    try {
      const supabase = createClient()
      await supabase.rpc('increment_note_view_count', { target_note_id: noteId })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.resource_url && note.resource_url.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (note.file_url && note.file_url.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTag = selectedTag === 'all' || note.tags?.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">Loading study materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text dark:text-text-dark mb-2">
              Study Notes
            </h1>
            <p className="text-text-muted">
              Curated resources to help you ace your placements
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search notes, resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="input"
          >
            <option value="all">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="input"
          >
            <option value="all">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-text mb-2">
              No notes found
            </h3>
            <p className="text-sm text-text-muted">
              {searchTerm || selectedStage !== 'all' || selectedTag !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No study materials available yet. Check back later!'
              }
            </p>
          </motion.div>
        ) : (
          <ResponsiveGrid 
            cols={{ sm: 1, md: 2, lg: 3 }}
            gap={6}
          >
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text dark:text-text-dark truncate mb-2">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {note.target_stage && (
                            <Badge variant="default">{note.target_stage}</Badge>
                          )}
                          {note.tags?.map(tag => (
                            <Badge key={tag} variant="secondary">#{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-text-muted">
                        {note.view_count} views
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Resource Links */}
                      {(note.resource_url || note.file_url) && (
                        <div className="space-y-2">
                          {note.resource_url && (
                            <a
                              href={note.resource_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => incrementViewCount(note.id)}
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
                              onClick={() => incrementViewCount(note.id)}
                              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              View File
                            </a>
                          )}
                        </div>
                      )}

                      {/* View Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => incrementViewCount(note.id)}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </ResponsiveGrid>
        )}

        {/* Results Summary */}
        {filteredNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-sm text-text-muted"
          >
            Showing {filteredNotes.length} of {notes.length} notes
          </motion.div>
        )}
      </div>

    </div>
  )
}
