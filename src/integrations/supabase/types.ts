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
      ad_clicks: {
        Row: {
          advertisement_id: string
          clicked_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          advertisement_id: string
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          advertisement_id?: string
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_spots: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: Database["public"]["Enums"]["ad_spot_location"]
          max_ads: number | null
          name: string
          price_per_day: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location: Database["public"]["Enums"]["ad_spot_location"]
          max_ads?: number | null
          name: string
          price_per_day: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: Database["public"]["Enums"]["ad_spot_location"]
          max_ads?: number | null
          name?: string
          price_per_day?: number
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          ad_spot_id: string
          business_id: string
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          image_url: string
          impressions: number | null
          link_url: string | null
          paid_at: string | null
          payment_reference: string | null
          payment_status: string | null
          start_date: string
          status: Database["public"]["Enums"]["ad_status"] | null
          stripe_payment_id: string | null
          title: string
          total_cost: number
          updated_at: string | null
        }
        Insert: {
          ad_spot_id: string
          business_id: string
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          image_url: string
          impressions?: number | null
          link_url?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["ad_status"] | null
          stripe_payment_id?: string | null
          title: string
          total_cost: number
          updated_at?: string | null
        }
        Update: {
          ad_spot_id?: string
          business_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string
          impressions?: number | null
          link_url?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["ad_status"] | null
          stripe_payment_id?: string | null
          title?: string
          total_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_ad_spot_id_fkey"
            columns: ["ad_spot_id"]
            isOneToOne: false
            referencedRelation: "ad_spots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertisements_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      business_claims: {
        Row: {
          admin_notes: string | null
          business_data: Json | null
          business_id: string | null
          claim_type: Database["public"]["Enums"]["claim_type"]
          created_at: string | null
          documents: Json | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["claim_status"]
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_data?: Json | null
          business_id?: string | null
          claim_type: Database["public"]["Enums"]["claim_type"]
          created_at?: string | null
          documents?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_data?: Json | null
          business_id?: string | null
          claim_type?: Database["public"]["Enums"]["claim_type"]
          created_at?: string | null
          documents?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_claims_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_owners: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_owners_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_views: {
        Row: {
          business_id: string
          id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          business_id: string
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          business_id?: string
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_views_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          business_hours: Json | null
          category: string
          created_at: string | null
          description: string | null
          email: string | null
          gallery_images: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          rating: number | null
          region: string
          review_count: number | null
          updated_at: string | null
          video_duration: number | null
          video_thumbnail_url: string | null
          video_url: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          category: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          region: string
          review_count?: number | null
          updated_at?: string | null
          video_duration?: number | null
          video_thumbnail_url?: string | null
          video_url?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          category?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          region?: string
          review_count?: number | null
          updated_at?: string | null
          video_duration?: number | null
          video_thumbnail_url?: string | null
          video_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          advertisement_id: string
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string
          status: string
          updated_at: string | null
        }
        Insert: {
          advertisement_id: string
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          advertisement_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      review_helpful: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string
          comment: string
          created_at: string | null
          helpful_count: number | null
          id: string
          rating: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          comment: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          comment?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
          role: Database["public"]["Enums"]["app_role"]
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
      get_admin_stats: {
        Args: never
        Returns: {
          pending_claims: number
          total_businesses: number
          total_reviews: number
          total_users: number
        }[]
      }
      get_recent_activity: {
        Args: never
        Returns: {
          activity_type: string
          created_at: string
          description: string
          id: string
          title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ad_spot_location:
        | "home_hero"
        | "home_sidebar"
        | "business_list_top"
        | "business_detail_sidebar"
        | "search_results"
      ad_status: "draft" | "pending_payment" | "active" | "paused" | "expired"
      app_role: "user" | "business_owner" | "admin"
      claim_status: "pending" | "approved" | "rejected"
      claim_type: "new_business" | "claim_existing"
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
      ad_spot_location: [
        "home_hero",
        "home_sidebar",
        "business_list_top",
        "business_detail_sidebar",
        "search_results",
      ],
      ad_status: ["draft", "pending_payment", "active", "paused", "expired"],
      app_role: ["user", "business_owner", "admin"],
      claim_status: ["pending", "approved", "rejected"],
      claim_type: ["new_business", "claim_existing"],
    },
  },
} as const
