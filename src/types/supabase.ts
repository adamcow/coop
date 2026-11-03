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
      families: {
        Row: { id: string; name: string; created_at: string | null }
        Insert: { id?: string; name: string; created_at?: string | null }
        Update: { id?: string; name?: string; created_at?: string | null }
        Relationships: []
      }
      family_members: {
        Row: { family_id: string; user_id: string; role: string; created_at: string | null }
        Insert: { family_id: string; user_id: string; role?: string; created_at?: string | null }
        Update: { family_id?: string; user_id?: string; role?: string; created_at?: string | null }
        Relationships: []
      }
      coops: {
        Row: { id: string; family_id: string; name: string; notes: string | null; created_at: string | null }
        Insert: { id?: string; family_id?: string; name: string; notes?: string | null; created_at?: string | null }
        Update: { id?: string; family_id?: string; name?: string; notes?: string | null; created_at?: string | null }
        Relationships: []
      }
      chickens: {
        Row: { id: string; family_id: string; coop_id: string | null; name: string; breed: string | null; sex: string | null; status: string | null; hatch_date: string | null; features: string | null; photo_url: string | null; created_at: string | null }
        Insert: { id?: string; family_id?: string; coop_id?: string | null; name: string; breed?: string | null; sex?: string | null; status?: string | null; hatch_date?: string | null; features?: string | null; photo_url?: string | null; created_at?: string | null }
        Update: { id?: string; family_id?: string; coop_id?: string | null; name?: string; breed?: string | null; sex?: string | null; status?: string | null; hatch_date?: string | null; features?: string | null; photo_url?: string | null; created_at?: string | null }
        Relationships: []
      }
      logs: {
        Row: { id: string; family_id: string; chicken_id: string | null; log_type: string; notes: string; created_at: string | null }
        Insert: { id?: string; family_id?: string; chicken_id?: string | null; log_type: string; notes: string; created_at?: string | null }
        Update: { id?: string; family_id?: string; chicken_id?: string | null; log_type?: string; notes?: string; created_at?: string | null }
        Relationships: []
      }
      egg_logs: {
        Row: { id: string; family_id: string; chicken_id: string | null; date: string; count: number; created_at: string | null }
        Insert: { id?: string; family_id?: string; chicken_id?: string | null; date?: string; count?: number; created_at?: string | null }
        Update: { id?: string; family_id?: string; chicken_id?: string | null; date?: string; count?: number; created_at?: string | null }
        Relationships: []
      }
    }
    Views: { [key: string]: never }
    Functions: { [key: string]: never }
    Enums: { [key: string]: string }
    CompositeTypes: { [key: string]: never }
  }
}