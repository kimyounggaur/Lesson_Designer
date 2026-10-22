// Supabase 프로젝트 lesson-designer(cgoafcjvnbzozxbbyfle) 스키마에서 생성 — 2026-10-22.
// 재생성: SUPABASE_PROJECT_ID=cgoafcjvnbzozxbbyfle npm run db:types (또는 Supabase MCP generate_typescript_types).
// 이 DB는 ScoreForge 등 다른 앱과 공유되므로 Lesson Designer가 쓰지 않는 테이블도 포함된다.
// 수동 편집 금지.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17";
  };
  public: {
    Tables: {
      api_cost_log: {
        Row: {
          cache_creation_input_tokens_1h: number;
          cache_creation_input_tokens_5m: number;
          cache_read_input_tokens: number;
          cost_usd: number;
          created_at: string;
          id: string;
          input_tokens: number;
          job_id: string;
          model: string;
          output_tokens: number;
          page_num: number | null;
        };
        Insert: {
          cache_creation_input_tokens_1h?: number;
          cache_creation_input_tokens_5m?: number;
          cache_read_input_tokens?: number;
          cost_usd?: number;
          created_at?: string;
          id?: string;
          input_tokens?: number;
          job_id: string;
          model: string;
          output_tokens?: number;
          page_num?: number | null;
        };
        Update: {
          cache_creation_input_tokens_1h?: number;
          cache_creation_input_tokens_5m?: number;
          cache_read_input_tokens?: number;
          cost_usd?: number;
          created_at?: string;
          id?: string;
          input_tokens?: number;
          job_id?: string;
          model?: string;
          output_tokens?: number;
          page_num?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "api_cost_log_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_cost_summary: {
        Row: {
          date: string;
          opus_cost: number;
          sonnet_cost: number;
          total_cost_usd: number;
          total_jobs: number;
          updated_at: string;
        };
        Insert: {
          date: string;
          opus_cost?: number;
          sonnet_cost?: number;
          total_cost_usd?: number;
          total_jobs?: number;
          updated_at?: string;
        };
        Update: {
          date?: string;
          opus_cost?: number;
          sonnet_cost?: number;
          total_cost_usd?: number;
          total_jobs?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      grant_documents: {
        Row: {
          created_at: string;
          grant_notice_id: string;
          id: string;
          mime_type: string;
          openai_file_id: string | null;
          original_filename: string;
          owner_id: string;
          sha256: string | null;
          size_bytes: number;
          storage_path: string;
          vector_store_id: string | null;
        };
        Insert: {
          created_at?: string;
          grant_notice_id: string;
          id?: string;
          mime_type: string;
          openai_file_id?: string | null;
          original_filename: string;
          owner_id: string;
          sha256?: string | null;
          size_bytes: number;
          storage_path: string;
          vector_store_id?: string | null;
        };
        Update: {
          created_at?: string;
          grant_notice_id?: string;
          id?: string;
          mime_type?: string;
          openai_file_id?: string | null;
          original_filename?: string;
          owner_id?: string;
          sha256?: string | null;
          size_bytes?: number;
          storage_path?: string;
          vector_store_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "grant_documents_grant_notice_id_fkey";
            columns: ["grant_notice_id"];
            isOneToOne: false;
            referencedRelation: "grant_notices";
            referencedColumns: ["id"];
          }
        ];
      };
      grant_notices: {
        Row: {
          created_at: string;
          deadline_at: string | null;
          id: string;
          owner_id: string;
          source_hash: string | null;
          source_text: string | null;
          source_url: string | null;
          status: Database["public"]["Enums"]["grant_notice_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deadline_at?: string | null;
          id?: string;
          owner_id: string;
          source_hash?: string | null;
          source_text?: string | null;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["grant_notice_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deadline_at?: string | null;
          id?: string;
          owner_id?: string;
          source_hash?: string | null;
          source_text?: string | null;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["grant_notice_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          accuracy_score: number | null;
          cost_breakdown: Json;
          cost_usd: number | null;
          created_at: string;
          engine: string | null;
          error: string | null;
          id: string;
          needs_human_count: number | null;
          page_count: number | null;
          pdf_kind: string | null;
          preprocess: Json | null;
          report: Json | null;
          result_mxl_path: string | null;
          source_path: string;
          stage: string | null;
          status: string;
        };
        Insert: {
          accuracy_score?: number | null;
          cost_breakdown?: Json;
          cost_usd?: number | null;
          created_at?: string;
          engine?: string | null;
          error?: string | null;
          id?: string;
          needs_human_count?: number | null;
          page_count?: number | null;
          pdf_kind?: string | null;
          preprocess?: Json | null;
          report?: Json | null;
          result_mxl_path?: string | null;
          source_path: string;
          stage?: string | null;
          status?: string;
        };
        Update: {
          accuracy_score?: number | null;
          cost_breakdown?: Json;
          cost_usd?: number | null;
          created_at?: string;
          engine?: string | null;
          error?: string | null;
          id?: string;
          needs_human_count?: number | null;
          page_count?: number | null;
          pdf_kind?: string | null;
          preprocess?: Json | null;
          report?: Json | null;
          result_mxl_path?: string | null;
          source_path?: string;
          stage?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scores: {
        Row: {
          created_at: string;
          data: Json;
          id: string;
          is_public: boolean;
          measures: number;
          owner: string;
          share_slug: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          data: Json;
          id?: string;
          is_public?: boolean;
          measures?: number;
          owner: string;
          share_slug?: string | null;
          title?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          data?: Json;
          id?: string;
          is_public?: boolean;
          measures?: number;
          owner?: string;
          share_slug?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      count_scoreforge_scores_by_owner: {
        Args: { owner_ids: string[] };
        Returns: {
          owner: string;
          score_count: number;
        }[];
      };
      get_shared_score: {
        Args: { slug: string };
        Returns: {
          data: Json;
          title: string;
        }[];
      };
      record_api_cost: {
        Args: {
          p_cache_creation_input_tokens_1h: number;
          p_cache_creation_input_tokens_5m: number;
          p_cache_read_input_tokens: number;
          p_cost_usd: number;
          p_input_tokens: number;
          p_job_id: string;
          p_model: string;
          p_output_tokens: number;
          p_page_num: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      grant_notice_status: "draft" | "ready_for_analysis" | "analyzed" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      grant_notice_status: ["draft", "ready_for_analysis", "analyzed", "archived"]
    }
  }
} as const;
