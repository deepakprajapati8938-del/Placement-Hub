import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@/lib/supabase/server'
import { Database } from './types'

// Client-side queries (for use in components)
export const clientQueries = {
  // Profile queries
  async getProfile(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Task queries
  async getTasks() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getUserTasks(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data || []
  },

  async updateUserTask(userId: string, taskId: string, updates: Partial<Database['public']['Tables']['user_tasks']['Update']>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_tasks')
      .update(updates)
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Notes queries
  async getNotes(filters?: { target_stage?: string }) {
    const supabase = createClient()
    let query = supabase
      .from('notes')
      .select('*')
      .order('uploaded_at', { ascending: false })
    
    if (filters?.target_stage) {
      query = query.eq('target_stage', filters.target_stage)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async incrementNoteViewCount(noteId: string) {
    const supabase = createClient()
    const { error } = await supabase.rpc('increment_note_view_count', { 
      note_id: noteId 
    })
    
    if (error) throw error
    return true
  },

  // Leaderboard queries
  async getLeaderboard() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leaderboard_rank')
      .select('*')
      .order('rank', { ascending: true })
    
    if (error) throw error
    return data || []
  },
}

// Server-side queries (for use in API routes)
export const serverQueries = {
  async getServerUser() {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async isAdmin(userId: string) {
    const supabase = createServerClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    
    if (!profile) return false
    
    return profile.full_name.toLowerCase().includes('admin')
  },

  async createTask(task: Omit<Database['public']['Tables']['tasks']['Insert'], 'id'>) {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateTask(taskId: string, updates: Partial<Database['public']['Tables']['tasks']['Update']>) {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteTask(taskId: string) {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    
    if (error) throw error
    return true
  },

  async createNote(note: Omit<Database['public']['Tables']['notes']['Insert'], 'id' | 'uploaded_at' | 'view_count'>) {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...note,
        uploaded_at: new Date().toISOString(),
        view_count: 0
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateNote(noteId: string, updates: Partial<Database['public']['Tables']['notes']['Update']>) {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteNote(noteId: string) {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    
    if (error) throw error
    return true
  },
}
