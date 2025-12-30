/**
 * TypeScript types for PNSDC-buildFlow Supabase database
 * Generated from schema in supabase/migrations/001_initial_schema.sql
 */

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
      fundraising_goal: {
        Row: {
          id: string
          goal_amount: number
          current_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goal_amount?: number
          current_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal_amount?: number
          current_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          id: string
          name: string
          unit: string
          quantity_needed: number
          quantity_current: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          unit: string
          quantity_needed?: number
          quantity_current?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          unit?: string
          quantity_needed?: number
          quantity_current?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          name: string
          pin_hash: string
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          name: string
          pin_hash: string
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          name?: string
          pin_hash?: string
          created_at?: string
          last_login?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          id: string
          donor_name: string | null
          is_anonymous: boolean
          amount: number
          material_id: string | null
          proof_image_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          admin_id: string | null
          created_at: string
          approved_at: string | null
        }
        Insert: {
          id?: string
          donor_name?: string | null
          is_anonymous?: boolean
          amount: number
          material_id?: string | null
          proof_image_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          admin_id?: string | null
          created_at?: string
          approved_at?: string | null
        }
        Update: {
          id?: string
          donor_name?: string | null
          is_anonymous?: boolean
          amount?: number
          material_id?: string | null
          proof_image_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          admin_id?: string | null
          created_at?: string
          approved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'donations_material_id_fkey'
            columns: ['material_id']
            isOneToOne: false
            referencedRelation: 'materials'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'donations_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'admins'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type FundraisingGoal = Database['public']['Tables']['fundraising_goal']['Row']
export type Material = Database['public']['Tables']['materials']['Row']
export type Admin = Database['public']['Tables']['admins']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']

export type DonationStatus = 'pending' | 'approved' | 'rejected'

// Insert types
export type NewDonation = Database['public']['Tables']['donations']['Insert']
export type NewMaterial = Database['public']['Tables']['materials']['Insert']
export type NewAdmin = Database['public']['Tables']['admins']['Insert']

// Update types
export type UpdateDonation = Database['public']['Tables']['donations']['Update']
export type UpdateMaterial = Database['public']['Tables']['materials']['Update']
export type UpdateFundraisingGoal = Database['public']['Tables']['fundraising_goal']['Update']
