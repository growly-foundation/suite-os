export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      agent_workflows: {
        Row: {
          agent_id: string;
          workflow_id: string;
        };
        Insert: {
          agent_id: string;
          workflow_id: string;
        };
        Update: {
          agent_id?: string;
          workflow_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'agent_workflows_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'agent_workflows_workflow_id_fkey';
            columns: ['workflow_id'];
            isOneToOne: false;
            referencedRelation: 'workflows';
            referencedColumns: ['id'];
          },
        ];
      };
      agents: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          model: string;
          name: string;
          organization_id: string | null;
          resources: string[];
          status: Database['public']['Enums']['status'];
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          model: string;
          name: string;
          organization_id?: string | null;
          resources: string[];
          status: Database['public']['Enums']['status'];
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          model?: string;
          name?: string;
          organization_id?: string | null;
          resources?: string[];
          status?: Database['public']['Enums']['status'];
        };
        Relationships: [
          {
            foreignKeyName: 'agents_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          agent_id: string | null;
          content: string;
          created_at: string | null;
          embedding: string | null;
          id: string;
          sender: Database['public']['Enums']['conversation_role'];
          user_id: string | null;
        };
        Insert: {
          agent_id?: string | null;
          content: string;
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          sender: Database['public']['Enums']['conversation_role'];
          user_id?: string | null;
        };
        Update: {
          agent_id?: string | null;
          content?: string;
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          sender?: Database['public']['Enums']['conversation_role'];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          admin_id: string | null;
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          admin_id?: string | null;
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          admin_id?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'organizations_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'admins';
            referencedColumns: ['id'];
          },
        ];
      };
      steps: {
        Row: {
          action: Json;
          conditions: Json;
          created_at: string;
          description: string | null;
          id: string;
          index: number;
          name: string;
          status: Database['public']['Enums']['status'];
          workflow_id: string | null;
        };
        Insert: {
          action: Json;
          conditions: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          index?: number;
          name: string;
          status: Database['public']['Enums']['status'];
          workflow_id?: string | null;
        };
        Update: {
          action?: Json;
          conditions?: Json;
          created_at?: string;
          description?: string | null;
          id?: string;
          index?: number;
          name?: string;
          status?: Database['public']['Enums']['status'];
          workflow_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'steps_workflow_id_fkey';
            columns: ['workflow_id'];
            isOneToOne: false;
            referencedRelation: 'workflows';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          entities: Json;
          id: string;
        };
        Insert: {
          created_at?: string;
          entities: Json;
          id?: string;
        };
        Update: {
          created_at?: string;
          entities?: Json;
          id?: string;
        };
        Relationships: [];
      };
      workflows: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          organization_id: string | null;
          status: Database['public']['Enums']['status'];
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          organization_id?: string | null;
          status: Database['public']['Enums']['status'];
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          organization_id?: string | null;
          status?: Database['public']['Enums']['status'];
        };
        Relationships: [
          {
            foreignKeyName: 'workflows_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      binary_quantize: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      get_recent_messages: {
        Args: { p_user_id: string; p_agent_id: string; p_limit?: number };
        Returns: {
          id: string;
          content: string;
          user_id: string;
          agent_id: string;
          sender: string;
          created_at: string;
        }[];
      };
      halfvec_avg: {
        Args: { '': number[] };
        Returns: unknown;
      };
      halfvec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      halfvec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnswhandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      l2_norm: {
        Args: { '': unknown } | { '': unknown };
        Returns: number;
      };
      l2_normalize: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: string;
      };
      match_messages: {
        Args: {
          query_embedding: string;
          match_threshold: number;
          match_count: number;
          in_user_id: string;
          in_agent_id: string;
        };
        Returns: {
          id: string;
          content: string;
          user_id: string;
          agent_id: string;
          sender: string;
          created_at: string;
          similarity: number;
        }[];
      };
      sparsevec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      summarize_conversation: {
        Args: { p_user_id: string; p_agent_id: string };
        Returns: {
          total_messages: number;
          user_messages: number;
          assistant_messages: number;
          first_message_at: string;
          last_message_at: string;
        }[];
      };
      vector_avg: {
        Args: { '': number[] };
        Returns: string;
      };
      vector_dims: {
        Args: { '': string } | { '': unknown };
        Returns: number;
      };
      vector_norm: {
        Args: { '': string };
        Returns: number;
      };
      vector_out: {
        Args: { '': string };
        Returns: unknown;
      };
      vector_send: {
        Args: { '': string };
        Returns: string;
      };
      vector_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
    };
    Enums: {
      conversation_role: 'user' | 'assistant' | 'system';
      status: 'active' | 'inactive';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      conversation_role: ['user', 'assistant', 'system'],
      status: ['active', 'inactive'],
    },
  },
} as const;
