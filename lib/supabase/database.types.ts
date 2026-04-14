export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      comment_user_moderation: {
        Row: {
          created_at: string
          is_banned: boolean
          is_trusted: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_banned?: boolean
          is_trusted?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_banned?: boolean
          is_trusted?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          author_ip_hash: string | null
          body: string
          created_at: string
          deleted_at: string | null
          edit_window_expires_at: string
          edited_at: string | null
          hidden_at: string | null
          id: string
          moderation_reason: string | null
          normalized_body: string
          parent_id: string | null
          post_slug: string
          status: "visible" | "hidden" | "deleted"
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          author_id: string
          author_ip_hash?: string | null
          body: string
          created_at?: string
          deleted_at?: string | null
          edit_window_expires_at?: string
          edited_at?: string | null
          hidden_at?: string | null
          id?: string
          moderation_reason?: string | null
          normalized_body: string
          parent_id?: string | null
          post_slug: string
          status?: "visible" | "hidden" | "deleted"
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          author_id?: string
          author_ip_hash?: string | null
          body?: string
          created_at?: string
          deleted_at?: string | null
          edit_window_expires_at?: string
          edited_at?: string | null
          hidden_at?: string | null
          id?: string
          moderation_reason?: string | null
          normalized_body?: string
          parent_id?: string | null
          post_slug?: string
          status?: "visible" | "hidden" | "deleted"
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: "open" | "reviewed" | "dismissed"
        }
        Insert: {
          comment_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: "open" | "reviewed" | "dismissed"
        }
        Update: {
          comment_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: "open" | "reviewed" | "dismissed"
        }
        Relationships: []
      }
      comment_rate_limits: {
        Row: {
          attempts: number
          created_at: string
          id: string
          scope: string
          scope_key: string
          updated_at: string
          window_starts_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          scope: string
          scope_key: string
          updated_at?: string
          window_starts_at: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          scope?: string
          scope_key?: string
          updated_at?: string
          window_starts_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
