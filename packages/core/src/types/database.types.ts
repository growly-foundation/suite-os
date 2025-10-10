export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_organizations: {
        Row: {
          admin_id: string
          created_at: string
          organization_id: string
          role: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          organization_id: string
          role?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          organization_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_organizations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      agent_resources: {
        Row: {
          agent_id: string
          created_at: string
          resource_id: string
          status: Database["public"]["Enums"]["status"]
        }
        Insert: {
          agent_id: string
          created_at?: string
          resource_id: string
          status?: Database["public"]["Enums"]["status"]
        }
        Update: {
          agent_id?: string
          created_at?: string
          resource_id?: string
          status?: Database["public"]["Enums"]["status"]
        }
        Relationships: [
          {
            foreignKeyName: "agent_resources_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_workflows: {
        Row: {
          agent_id: string
          created_at: string
          status: Database["public"]["Enums"]["status"]
          workflow_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          status?: Database["public"]["Enums"]["status"]
          workflow_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          status?: Database["public"]["Enums"]["status"]
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_workflows_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_workflows_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          model: string
          name: string
          organization_id: string | null
          status: Database["public"]["Enums"]["status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          model: string
          name: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          model?: string
          name?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status"]
        }
        Relationships: [
          {
            foreignKeyName: "agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          embedding: string | null
          id: string
          sender: Database["public"]["Enums"]["conversation_role"]
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          sender: Database["public"]["Enums"]["conversation_role"]
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          sender?: Database["public"]["Enums"]["conversation_role"]
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          handle: string | null
          id: string
          logo_url: string | null
          name: string
          referral_source: string | null
          supported_chain_ids: number[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          handle?: string | null
          id?: string
          logo_url?: string | null
          name: string
          referral_source?: string | null
          supported_chain_ids?: number[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          handle?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          referral_source?: string | null
          supported_chain_ids?: number[] | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string | null
          status: Database["public"]["Enums"]["status"]
          type: Database["public"]["Enums"]["resource_type"]
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status"]
          type: Database["public"]["Enums"]["resource_type"]
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status"]
          type?: Database["public"]["Enums"]["resource_type"]
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      step_sessions: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          step_id: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          step_id?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          step_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "step_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_sessions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      steps: {
        Row: {
          action: Json
          conditions: Json
          created_at: string
          description: string | null
          id: string
          index: number
          is_beast_mode: boolean
          is_repeat: boolean
          name: string
          status: Database["public"]["Enums"]["status"]
          workflow_id: string | null
        }
        Insert: {
          action: Json
          conditions: Json
          created_at?: string
          description?: string | null
          id?: string
          index?: number
          is_beast_mode?: boolean
          is_repeat?: boolean
          name: string
          status?: Database["public"]["Enums"]["status"]
          workflow_id?: string | null
        }
        Update: {
          action?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          index?: number
          is_beast_mode?: boolean
          is_repeat?: boolean
          name?: string
          status?: Database["public"]["Enums"]["status"]
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      user_personas: {
        Row: {
          activities: Json
          created_at: string
          error_message: string | null
          id: string
          identities: Json
          imported_source_data: Json[]
          last_synced_at: string | null
          portfolio_snapshots: Json
          retry_count: number | null
          sync_status: Database["public"]["Enums"]["sync_status"]
          updated_at: string
        }
        Insert: {
          activities: Json
          created_at?: string
          error_message?: string | null
          id: string
          identities: Json
          imported_source_data?: Json[]
          last_synced_at?: string | null
          portfolio_snapshots: Json
          retry_count?: number | null
          sync_status?: Database["public"]["Enums"]["sync_status"]
          updated_at?: string
        }
        Update: {
          activities?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          identities?: Json
          imported_source_data?: Json[]
          last_synced_at?: string | null
          portfolio_snapshots?: Json
          retry_count?: number | null
          sync_status?: Database["public"]["Enums"]["sync_status"]
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_anonymous: boolean | null
          name: string | null
          organization_id: string
          original_joined_at: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_anonymous?: boolean | null
          name?: string | null
          organization_id: string
          original_joined_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_anonymous?: boolean | null
          name?: string | null
          organization_id?: string
          original_joined_at?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          status: Database["public"]["Enums"]["status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status"]
        }
        Relationships: [
          {
            foreignKeyName: "workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_admin_aggregated_organizations: {
        Args: { p_admin_id: string }
        Returns: {
          agents: Json
          organization_id: string
          organization_name: string
        }[]
      }
      get_admin_organization_with_agents_and_workflows: {
        Args: { p_admin_id: string }
        Returns: {
          agents: Json
          organization_id: string
          organization_name: string
        }[]
      }
      get_admin_organizations: {
        Args: { p_admin_id: string }
        Returns: {
          admin_id: string
          organization_id: string
        }[]
      }
      get_agents_with_workflows: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_id: string
          created_at: string
          description: string
          model: string
          name: string
          organization_id: string
          resources: string[]
          status: Database["public"]["Enums"]["status"]
          workflows: string[]
        }[]
      }
      get_recent_messages: {
        Args: { p_agent_id: string; p_limit?: number; p_user_id: string }
        Returns: {
          agent_id: string
          content: string
          created_at: string
          id: string
          sender: string
          user_id: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_messages: {
        Args: {
          in_agent_id: string
          in_user_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          agent_id: string
          content: string
          created_at: string
          id: string
          sender: string
          similarity: number
          user_id: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      summarize_conversation: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: {
          assistant_messages: number
          first_message_at: string
          last_message_at: string
          total_messages: number
          user_messages: number
        }[]
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      conversation_role: "user" | "assistant" | "system" | "admin"
      resource_type: "contract" | "link" | "document" | "text"
      status: "active" | "inactive"
      sync_status: "pending" | "running" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conversation_role: ["user", "assistant", "system", "admin"],
      resource_type: ["contract", "link", "document", "text"],
      status: ["active", "inactive"],
      sync_status: ["pending", "running", "completed", "failed"],
    },
  },
} as const
