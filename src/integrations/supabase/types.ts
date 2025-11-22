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
      ad_benchmarks: {
        Row: {
          avg_conversion_rate: number | null
          avg_cost_per_click: number | null
          avg_ctr: number | null
          category: string
          id: string
          region: string | null
          sample_size: number | null
          updated_at: string | null
        }
        Insert: {
          avg_conversion_rate?: number | null
          avg_cost_per_click?: number | null
          avg_ctr?: number | null
          category: string
          id?: string
          region?: string | null
          sample_size?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_conversion_rate?: number | null
          avg_cost_per_click?: number | null
          avg_ctr?: number | null
          category?: string
          id?: string
          region?: string | null
          sample_size?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      ad_conversions: {
        Row: {
          advertisement_id: string
          conversion_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string | null
          value: number | null
          variant_id: string | null
        }
        Insert: {
          advertisement_id: string
          conversion_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          value?: number | null
          variant_id?: string | null
        }
        Update: {
          advertisement_id?: string
          conversion_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          value?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_conversions_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_conversions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ad_variants"
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
      ad_roi_tracking: {
        Row: {
          advertisement_id: string
          conversions: number | null
          created_at: string | null
          date: string
          id: string
          roi_percentage: number | null
          total_revenue: number | null
          total_spend: number | null
        }
        Insert: {
          advertisement_id: string
          conversions?: number | null
          created_at?: string | null
          date: string
          id?: string
          roi_percentage?: number | null
          total_revenue?: number | null
          total_spend?: number | null
        }
        Update: {
          advertisement_id?: string
          conversions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          roi_percentage?: number | null
          total_revenue?: number | null
          total_spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_roi_tracking_advertisement_id_fkey"
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
      ad_variants: {
        Row: {
          advertisement_id: string
          clicks: number | null
          conversions: number | null
          created_at: string | null
          cta_text: string | null
          description: string | null
          id: string
          image_url: string
          impressions: number | null
          is_winner: boolean | null
          title: string
          traffic_allocation: number | null
          variant_name: string
        }
        Insert: {
          advertisement_id: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url: string
          impressions?: number | null
          is_winner?: boolean | null
          title: string
          traffic_allocation?: number | null
          variant_name: string
        }
        Update: {
          advertisement_id?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string
          impressions?: number | null
          is_winner?: boolean | null
          title?: string
          traffic_allocation?: number | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_variants_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
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
          video_duration: number | null
          video_thumbnail_url: string | null
          video_url: string | null
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
          video_duration?: number | null
          video_thumbnail_url?: string | null
          video_url?: string | null
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
          video_duration?: number | null
          video_thumbnail_url?: string | null
          video_url?: string | null
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
      business_leads: {
        Row: {
          assigned_to: string | null
          business_id: string
          company: string | null
          created_at: string | null
          email: string
          form_id: string | null
          id: string
          ip_address: string | null
          message: string | null
          metadata: Json | null
          name: string
          phone: string | null
          score: number | null
          source: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          assigned_to?: string | null
          business_id: string
          company?: string | null
          created_at?: string | null
          email: string
          form_id?: string | null
          id?: string
          ip_address?: string | null
          message?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          assigned_to?: string | null
          business_id?: string
          company?: string | null
          created_at?: string | null
          email?: string
          form_id?: string | null
          id?: string
          ip_address?: string | null
          message?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_leads_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "lead_forms"
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
      business_status_cache: {
        Row: {
          business_id: string
          is_open_now: boolean | null
          next_closes_at: string | null
          next_opens_at: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          is_open_now?: boolean | null
          next_closes_at?: string | null
          next_opens_at?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          is_open_now?: boolean | null
          next_closes_at?: string | null
          next_opens_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_status_cache_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          admin_notes: string | null
          amount: number
          auto_renew: boolean | null
          business_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          current_usage: Json | null
          end_date: string
          id: string
          lifetime_value: number | null
          payment_method: string | null
          payment_reference: string | null
          plan_id: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          auto_renew?: boolean | null
          business_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_usage?: Json | null
          end_date: string
          id?: string
          lifetime_value?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          plan_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          auto_renew?: boolean | null
          business_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_usage?: Json | null
          end_date?: string
          id?: string
          lifetime_value?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          plan_id?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
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
          is_premium: boolean | null
          is_sponsored: boolean | null
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          premium_until: string | null
          rating: number | null
          region: string
          review_count: number | null
          sponsored_until: string | null
          trust_score: number | null
          updated_at: string | null
          verification_documents: Json | null
          verification_tier: string | null
          verified_at: string | null
          verified_by: string | null
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
          is_premium?: boolean | null
          is_sponsored?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          premium_until?: string | null
          rating?: number | null
          region: string
          review_count?: number | null
          sponsored_until?: string | null
          trust_score?: number | null
          updated_at?: string | null
          verification_documents?: Json | null
          verification_tier?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
          is_premium?: boolean | null
          is_sponsored?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          premium_until?: string | null
          rating?: number | null
          region?: string
          review_count?: number | null
          sponsored_until?: string | null
          trust_score?: number | null
          updated_at?: string | null
          verification_documents?: Json | null
          verification_tier?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
      email_preferences: {
        Row: {
          application_notifications: boolean | null
          created_at: string | null
          digest_emails: boolean | null
          id: string
          interview_reminders: boolean | null
          job_alert_emails: boolean | null
          marketing_emails: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_notifications?: boolean | null
          created_at?: string | null
          digest_emails?: boolean | null
          id?: string
          interview_reminders?: boolean | null
          job_alert_emails?: boolean | null
          marketing_emails?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_notifications?: boolean | null
          created_at?: string | null
          digest_emails?: boolean | null
          id?: string
          interview_reminders?: boolean | null
          job_alert_emails?: boolean | null
          marketing_emails?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          boost_payment_reference: string | null
          boosted_until: string | null
          business_id: string
          category: string
          created_at: string | null
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          expires_at: string | null
          flag_reason: string | null
          id: string
          is_boosted: boolean | null
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
          boost_payment_reference?: string | null
          boosted_until?: string | null
          business_id: string
          category: string
          created_at?: string | null
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          expires_at?: string | null
          flag_reason?: string | null
          id?: string
          is_boosted?: boolean | null
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
          boost_payment_reference?: string | null
          boosted_until?: string | null
          business_id?: string
          category?: string
          created_at?: string | null
          description?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          expires_at?: string | null
          flag_reason?: string | null
          id?: string
          is_boosted?: boolean | null
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
      lead_activities: {
        Row: {
          activity_type: string
          content: string | null
          created_at: string | null
          created_by: string
          id: string
          lead_id: string
          metadata: Json | null
        }
        Insert: {
          activity_type: string
          content?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          lead_id: string
          metadata?: Json | null
        }
        Update: {
          activity_type?: string
          content?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "business_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_forms: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          email_notifications: boolean | null
          fields: Json
          form_type: string | null
          id: string
          is_active: boolean | null
          name: string
          notification_emails: string[] | null
          redirect_url: string | null
          spam_protection: boolean | null
          success_message: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          email_notifications?: boolean | null
          fields: Json
          form_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notification_emails?: string[] | null
          redirect_url?: string | null
          spam_protection?: boolean | null
          success_message?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          email_notifications?: boolean | null
          fields?: Json
          form_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notification_emails?: string[] | null
          redirect_url?: string | null
          spam_protection?: boolean | null
          success_message?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_forms_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_response_templates: {
        Row: {
          body: string
          business_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          template_type: string | null
        }
        Insert: {
          body: string
          business_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          template_type?: string | null
        }
        Update: {
          body?: string
          business_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          template_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_response_templates_business_id_fkey"
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
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean
          logo_url: string
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
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
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          target_plans: string[] | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          target_plans?: string[] | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          target_plans?: string[] | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      review_flags: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          flagged_by: string
          id: string
          reason: string
          review_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          flagged_by: string
          id?: string
          reason: string
          review_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          flagged_by?: string
          id?: string
          reason?: string
          review_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_flags_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
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
          authenticity_score: number | null
          business_id: string
          comment: string
          created_at: string | null
          flag_reason: string | null
          flagged_as_fake: boolean | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          authenticity_score?: number | null
          business_id: string
          comment: string
          created_at?: string | null
          flag_reason?: string | null
          flagged_as_fake?: boolean | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          authenticity_score?: number | null
          business_id?: string
          comment?: string
          created_at?: string | null
          flag_reason?: string | null
          flagged_as_fake?: boolean | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
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
      search_history: {
        Row: {
          clicked_business_id: string | null
          created_at: string | null
          id: string
          search_query: string
          user_id: string | null
        }
        Insert: {
          clicked_business_id?: string | null
          created_at?: string | null
          id?: string
          search_query: string
          user_id?: string | null
        }
        Update: {
          clicked_business_id?: string | null
          created_at?: string | null
          id?: string
          search_query?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_clicked_business_id_fkey"
            columns: ["clicked_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      search_suggestions: {
        Row: {
          id: string
          popularity_score: number | null
          query: string
          suggestions: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          popularity_score?: number | null
          query: string
          suggestions: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          popularity_score?: number | null
          query?: string
          suggestions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          paid_at: string | null
          payment_reference: string | null
          pdf_url: string | null
          status: string | null
          subscription_id: string
          subscription_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          paid_at?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          status?: string | null
          subscription_id: string
          subscription_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          payment_reference?: string | null
          pdf_url?: string | null
          status?: string | null
          subscription_id?: string
          subscription_type?: string
        }
        Relationships: []
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
      subscription_plans: {
        Row: {
          billing_period: string
          created_at: string | null
          discount_percentage: number | null
          display_order: number | null
          features: Json
          id: string
          is_active: boolean | null
          limits: Json
          name: string
          popular: boolean | null
          price: number
          slug: string
          target_audience: string
        }
        Insert: {
          billing_period: string
          created_at?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          features: Json
          id?: string
          is_active?: boolean | null
          limits: Json
          name: string
          popular?: boolean | null
          price: number
          slug: string
          target_audience: string
        }
        Update: {
          billing_period?: string
          created_at?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          name?: string
          popular?: boolean | null
          price?: number
          slug?: string
          target_audience?: string
        }
        Relationships: []
      }
      subscription_usage_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          subscription_id: string
          subscription_type: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          subscription_id: string
          subscription_type: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          subscription_id?: string
          subscription_type?: string
        }
        Relationships: []
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
      verification_requests: {
        Row: {
          admin_notes: string | null
          business_id: string
          created_at: string | null
          documents: Json
          id: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          tier_requested: string
        }
        Insert: {
          admin_notes?: string | null
          business_id: string
          created_at?: string | null
          documents?: Json
          id?: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tier_requested: string
        }
        Update: {
          admin_notes?: string | null
          business_id?: string
          created_at?: string | null
          documents?: Json
          id?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tier_requested?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_trust_score: {
        Args: { p_business_id: string }
        Returns: number
      }
      check_business_subscription: {
        Args: { p_business_id: string }
        Returns: boolean
      }
      check_job_seeker_subscription: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
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
      is_business_open: { Args: { p_business_id: string }; Returns: boolean }
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
