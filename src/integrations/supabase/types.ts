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
      ad_impressions_daily: {
        Row: {
          advertisement_id: string
          clicks: number | null
          created_at: string | null
          date: string
          id: string
          impressions: number | null
        }
        Insert: {
          advertisement_id: string
          clicks?: number | null
          created_at?: string | null
          date: string
          id?: string
          impressions?: number | null
        }
        Update: {
          advertisement_id?: string
          clicks?: number | null
          created_at?: string | null
          date?: string
          id?: string
          impressions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_daily_advertisement_id_fkey"
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
      applicant_notes: {
        Row: {
          application_id: string
          author_id: string
          created_at: string | null
          id: string
          note: string
          updated_at: string | null
        }
        Insert: {
          application_id: string
          author_id: string
          created_at?: string | null
          id?: string
          note: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          author_id?: string
          created_at?: string | null
          id?: string
          note?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applicant_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applicant_tags: {
        Row: {
          application_id: string
          color: string | null
          created_at: string | null
          created_by: string
          id: string
          tag: string
        }
        Insert: {
          application_id: string
          color?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          tag: string
        }
        Update: {
          application_id?: string
          color?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "applicant_tags_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
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
      interview_schedule: {
        Row: {
          application_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          interviewer_id: string
          location: string | null
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          interviewer_id: string
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          interviewer_id?: string
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_schedule_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_alerts: {
        Row: {
          category: string | null
          created_at: string | null
          experience_level: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          job_type: string | null
          keywords: string | null
          last_sent_at: string | null
          location: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          experience_level?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          keywords?: string | null
          last_sent_at?: string | null
          location?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          experience_level?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string | null
          keywords?: string | null
          last_sent_at?: string | null
          location?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          application_duration: number | null
          applied_at: string | null
          cover_letter: string
          device_type: string | null
          id: string
          job_id: string
          notes: string | null
          quality_score: number | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          status_changed_at: string | null
          status_changed_by: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          application_duration?: number | null
          applied_at?: string | null
          cover_letter: string
          device_type?: string | null
          id?: string
          job_id: string
          notes?: string | null
          quality_score?: number | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          status_changed_at?: string | null
          status_changed_by?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          application_duration?: number | null
          applied_at?: string | null
          cover_letter?: string
          device_type?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          quality_score?: number | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          status_changed_at?: string | null
          status_changed_by?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_performance_cache: {
        Row: {
          conversion_score: number | null
          engagement_score: number | null
          job_id: string
          last_updated: string | null
          overall_score: number | null
          quality_score: number | null
          recommendations: Json | null
          visibility_score: number | null
        }
        Insert: {
          conversion_score?: number | null
          engagement_score?: number | null
          job_id: string
          last_updated?: string | null
          overall_score?: number | null
          quality_score?: number | null
          recommendations?: Json | null
          visibility_score?: number | null
        }
        Update: {
          conversion_score?: number | null
          engagement_score?: number | null
          job_id?: string
          last_updated?: string | null
          overall_score?: number | null
          quality_score?: number | null
          recommendations?: Json | null
          visibility_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_performance_cache_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_seeker_subscriptions: {
        Row: {
          admin_notes: string | null
          amount: number
          auto_renew: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          end_date: string
          id: string
          lifetime_value: number | null
          payment_method: string | null
          payment_reference: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          auto_renew?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          lifetime_value?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          auto_renew?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          lifetime_value?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_views: {
        Row: {
          device_type: string | null
          id: string
          job_id: string
          referrer: string | null
          session_id: string | null
          source: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          device_type?: string | null
          id?: string
          job_id: string
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          device_type?: string | null
          id?: string
          job_id?: string
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          admin_notes: string | null
          applications_count: number | null
          business_id: string
          category: string
          created_at: string | null
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          expires_at: string | null
          flag_reason: string | null
          id: string
          is_flagged: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          posted_at: string | null
          require_video: boolean | null
          requirements: string | null
          responsibilities: string | null
          salary_range: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at: string | null
          video_prompt: string | null
          views_count: number | null
        }
        Insert: {
          admin_notes?: string | null
          applications_count?: number | null
          business_id: string
          category: string
          created_at?: string | null
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          expires_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location?: string | null
          posted_at?: string | null
          require_video?: boolean | null
          requirements?: string | null
          responsibilities?: string | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at?: string | null
          video_prompt?: string | null
          views_count?: number | null
        }
        Update: {
          admin_notes?: string | null
          applications_count?: number | null
          business_id?: string
          category?: string
          created_at?: string | null
          description?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          expires_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          posted_at?: string | null
          require_video?: boolean | null
          requirements?: string | null
          responsibilities?: string | null
          salary_range?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          updated_at?: string | null
          video_prompt?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_business_id_fkey"
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
          availability: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          education: string | null
          email: string | null
          experience_years: number | null
          full_name: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          preferred_job_types: string[] | null
          preferred_locations: string[] | null
          resume_url: string | null
          salary_expectation: string | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          experience_years?: number | null
          full_name?: string | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_job_types?: string[] | null
          preferred_locations?: string[] | null
          resume_url?: string | null
          salary_expectation?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          education?: string | null
          email?: string | null
          experience_years?: number | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_job_types?: string[] | null
          preferred_locations?: string[] | null
          resume_url?: string | null
          salary_expectation?: string | null
          skills?: string[] | null
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
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string
          status: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference: string
          status?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string
          status?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "job_seeker_subscriptions"
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
      aggregate_daily_ad_stats: {
        Args: { target_date?: string }
        Returns: undefined
      }
      calculate_job_performance: {
        Args: { p_job_id: string }
        Returns: undefined
      }
      check_job_seeker_subscription: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      expire_old_jobs: { Args: never; Returns: undefined }
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
      application_status:
        | "pending"
        | "reviewed"
        | "shortlisted"
        | "rejected"
        | "accepted"
      claim_status: "pending" | "approved" | "rejected"
      claim_type: "new_business" | "claim_existing"
      experience_level: "entry" | "mid" | "senior" | "executive"
      job_status: "draft" | "active" | "closed" | "expired"
      job_type: "full_time" | "part_time" | "contract" | "internship"
      subscription_status: "active" | "expired" | "cancelled"
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
      application_status: [
        "pending",
        "reviewed",
        "shortlisted",
        "rejected",
        "accepted",
      ],
      claim_status: ["pending", "approved", "rejected"],
      claim_type: ["new_business", "claim_existing"],
      experience_level: ["entry", "mid", "senior", "executive"],
      job_status: ["draft", "active", "closed", "expired"],
      job_type: ["full_time", "part_time", "contract", "internship"],
      subscription_status: ["active", "expired", "cancelled"],
    },
  },
} as const
