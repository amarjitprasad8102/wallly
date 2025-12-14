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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          meta_description: string
          published_at: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          meta_description: string
          published_at?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          meta_description?: string
          published_at?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          banner_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          display_name: string
          icon_url: string | null
          id: string
          member_count: number
          name: string
          post_count: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          display_name: string
          icon_url?: string | null
          id?: string
          member_count?: number
          name: string
          post_count?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          display_name?: string
          icon_url?: string | null
          id?: string
          member_count?: number
          name?: string
          post_count?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          downvotes: number
          id: string
          post_id: string
          updated_at: string
          upvotes: number
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          downvotes?: number
          id?: string
          post_id: string
          updated_at?: string
          upvotes?: number
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          downvotes?: number
          id?: string
          post_id?: string
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          comment_count: number
          community_id: string
          content: string | null
          created_at: string
          downvotes: number
          id: string
          image_url: string | null
          title: string
          updated_at: string
          upvotes: number
        }
        Insert: {
          author_id: string
          comment_count?: number
          community_id: string
          content?: string | null
          created_at?: string
          downvotes?: number
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          upvotes?: number
        }
        Update: {
          author_id?: string
          comment_count?: number
          community_id?: string
          content?: string | null
          created_at?: string
          downvotes?: number
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          created_at: string | null
          from_user_id: string
          id: string
          status: string
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id: string
          id?: string
          status?: string
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string
          id?: string
          status?: string
          to_user_id?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          connected_user_id: string
          created_at: string
          id: string
          last_message_at: string | null
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      matchmaking_queue: {
        Row: {
          created_at: string | null
          id: string
          matched_at: string | null
          matched_with_unique_id: string | null
          matched_with_user_id: string | null
          status: string
          unique_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          matched_at?: string | null
          matched_with_unique_id?: string | null
          matched_with_user_id?: string | null
          status?: string
          unique_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          matched_at?: string | null
          matched_with_unique_id?: string | null
          matched_with_user_id?: string | null
          status?: string
          unique_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string | null
          email: string
          gender: string | null
          id: string
          is_premium: boolean | null
          premium_until: string | null
          unique_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          email: string
          gender?: string | null
          id: string
          is_premium?: boolean | null
          premium_until?: string | null
          unique_id: string
        }
        Update: {
          age?: number | null
          created_at?: string | null
          email?: string
          gender?: string | null
          id?: string
          is_premium?: boolean | null
          premium_until?: string | null
          unique_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string | null
          id: string
          interest_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_stale_queue_entries: { Args: never; Returns: number }
      create_bidirectional_connection: {
        Args: { user_a_id: string; user_b_id: string }
        Returns: undefined
      }
      find_match: {
        Args: { p_unique_id: string; p_user_id: string }
        Returns: {
          matched_unique_id: string
          matched_user_id: string
        }[]
      }
      find_match_with_interests: {
        Args: { p_unique_id: string; p_user_id: string }
        Returns: {
          matched_unique_id: string
          matched_user_id: string
          shared_interests: number
        }[]
      }
      generate_unique_id: { Args: never; Returns: string }
      get_queue_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "premium_user"
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
      app_role: ["admin", "user", "premium_user"],
    },
  },
} as const
