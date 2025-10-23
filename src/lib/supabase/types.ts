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
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'ADMIN' | 'CONSULTANT' | 'ASSEMBLER'
          email: string | null
          phone: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'ADMIN' | 'CONSULTANT' | 'ASSEMBLER'
          email?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'ADMIN' | 'CONSULTANT' | 'ASSEMBLER'
          email?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      store_customers: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          cpf: string | null
          birth_date: string | null
          address_street: string | null
          address_number: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          address_country: string | null
          password_hash: string | null
          email_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
          auth_user_id: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          phone?: string | null
          cpf?: string | null
          birth_date?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          address_country?: string | null
          password_hash?: string | null
          email_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          auth_user_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          cpf?: string | null
          birth_date?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          address_country?: string | null
          password_hash?: string | null
          email_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          auth_user_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: 'ADMIN' | 'CONSULTANT' | 'ASSEMBLER'
      }
    }
    Enums: {
      // user_role removido - usando TEXT simples
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
