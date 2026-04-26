export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_slug: string
          xp: number
          streak: number
          target_companies: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_slug?: string
          xp?: number
          streak?: number
          target_companies?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_slug?: string
          xp?: number
          streak?: number
          target_companies?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_phases: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          status: 'completed' | 'in-progress' | 'upcoming'
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'completed' | 'in-progress' | 'upcoming'
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'completed' | 'in-progress' | 'upcoming'
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          deadline: string | null
          priority: 'low' | 'medium' | 'high'
          tags: string[]
          roadmap_phase: string | null
          phase_id: string | null
          is_backlog: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          deadline?: string | null
          priority?: 'low' | 'medium' | 'high'
          tags?: string[]
          roadmap_phase?: string | null
          phase_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          deadline?: string | null
          priority?: 'low' | 'medium' | 'high'
          tags?: string[]
          roadmap_phase?: string | null
          phase_id?: string | null
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          resource_url: string | null
          file_url: string | null
          tags: string[]
          target_stage: string | null
          phase_id: string | null
          view_count: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          title: string
          resource_url?: string | null
          file_url?: string | null
          tags?: string[]
          target_stage?: string | null
          phase_id?: string | null
          view_count?: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          title?: string
          resource_url?: string | null
          file_url?: string | null
          tags?: string[]
          target_stage?: string | null
          phase_id?: string | null
          view_count?: number
          uploaded_at?: string
        }
      }
      user_tasks: {
        Row: {
          user_id: string
          task_id: string
          status: 'pending' | 'done' | 'rescheduled'
          reschedule_count: number
          completed_at: string | null
        }
        Insert: {
          user_id: string
          task_id: string
          status?: 'pending' | 'done' | 'rescheduled'
          reschedule_count?: number
          completed_at?: string | null
        }
        Update: {
          user_id?: string
          task_id?: string
          status?: 'pending' | 'done' | 'rescheduled'
          reschedule_count?: number
          completed_at?: string | null
        }
      }
    }
    Views: {
      leaderboard_rank: {
        Row: {
          id: string
          full_name: string
          avatar_slug: string
          xp: number
          rank: number
          backlog_count: number
        }
      }
    }
    Functions: {
      [key: string]: never
    }
    Enums: {
      [key: string]: never
    }
  }
}
