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
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_import_batches: {
        Row: {
          auto_matched_count: number
          created_at: string | null
          created_by: string | null
          id: string
          manual_matched_count: number
          pending_count: number
          source_name: string | null
          source_type: string
          status: string
          total_items: number
        }
        Insert: {
          auto_matched_count?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          manual_matched_count?: number
          pending_count?: number
          source_name?: string | null
          source_type: string
          status?: string
          total_items?: number
        }
        Update: {
          auto_matched_count?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          manual_matched_count?: number
          pending_count?: number
          source_name?: string | null
          source_type?: string
          status?: string
          total_items?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupon_import_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_import_items: {
        Row: {
          availability: string | null
          category_id: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          external_id: string | null
          id: string
          image_link: string | null
          import_batch_id: string
          match_confidence: number | null
          matched_place_id: string | null
          matched_place_name: string | null
          offer_link: string | null
          original_name: string
          original_price: number | null
          sale_price: number | null
          status: string
          suggested_places: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          image_link?: string | null
          import_batch_id: string
          match_confidence?: number | null
          matched_place_id?: string | null
          matched_place_name?: string | null
          offer_link?: string | null
          original_name: string
          original_price?: number | null
          sale_price?: number | null
          status?: string
          suggested_places?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          image_link?: string | null
          import_batch_id?: string
          match_confidence?: number | null
          matched_place_id?: string | null
          matched_place_name?: string | null
          offer_link?: string | null
          original_name?: string
          original_price?: number | null
          sale_price?: number | null
          status?: string
          suggested_places?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_import_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_import_items_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "coupon_import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_locations: {
        Row: {
          address: string | null
          category: string | null
          coordinates: Json | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          place_id: string
          price_level: number | null
          rating: number | null
          user_id: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          coordinates?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          place_id: string
          price_level?: number | null
          rating?: number | null
          user_id: string
        }
        Update: {
          address?: string | null
          category?: string | null
          coordinates?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          place_id?: string
          price_level?: number | null
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      location_coupons: {
        Row: {
          availability: string | null
          category_id: number | null
          code: string | null
          created_at: string | null
          currency: string | null
          current_uses: number | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          external_id: string | null
          id: string
          image_link: string | null
          import_batch_id: string | null
          is_active: boolean | null
          max_uses: number | null
          offer_link: string | null
          original_name: string | null
          original_price: number | null
          place_id: string
          sale_price: number | null
          terms: string | null
          title: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          availability?: string | null
          category_id?: number | null
          code?: string | null
          created_at?: string | null
          currency?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          external_id?: string | null
          id?: string
          image_link?: string | null
          import_batch_id?: string | null
          is_active?: boolean | null
          max_uses?: number | null
          offer_link?: string | null
          original_name?: string | null
          original_price?: number | null
          place_id: string
          sale_price?: number | null
          terms?: string | null
          title: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          availability?: string | null
          category_id?: number | null
          code?: string | null
          created_at?: string | null
          currency?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          external_id?: string | null
          id?: string
          image_link?: string | null
          import_batch_id?: string | null
          is_active?: boolean | null
          max_uses?: number | null
          offer_link?: string | null
          original_name?: string | null
          original_price?: number | null
          place_id?: string
          sale_price?: number | null
          terms?: string | null
          title?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_coupons_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "coupon_import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      location_reviews: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          images: string[] | null
          place_id: string
          rating: number
          review_type: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          place_id: string
          rating: number
          review_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          place_id?: string
          rating?: number
          review_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          post_id: string
          reason: string
          reporter_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_routes: {
        Row: {
          created_at: string
          post_id: string
          route_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          route_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_routes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_routes_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          city: string | null
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          images: string[] | null
          location: string | null
          rating: number | null
          state: string | null
          title: string | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
        }
        Insert: {
          author_id: string
          city?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          rating?: number | null
          state?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Update: {
          author_id?: string
          city?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          rating?: number | null
          state?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
          location: string | null
          onboarding_completed: boolean | null
          preferences_text: string | null
          status: boolean | null
          travel_preferences: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name: string
          id: string
          location?: string | null
          onboarding_completed?: boolean | null
          preferences_text?: string | null
          status?: boolean | null
          travel_preferences?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          location?: string | null
          onboarding_completed?: boolean | null
          preferences_text?: string | null
          status?: boolean | null
          travel_preferences?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      route_accommodations: {
        Row: {
          address: string | null
          check_in: string | null
          check_out: string | null
          confirmation_number: string | null
          created_at: string
          currency: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          price: number | null
          route_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          check_in?: string | null
          check_out?: string | null
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          price?: number | null
          route_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          check_in?: string | null
          check_out?: string | null
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          price?: number | null
          route_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_accommodations_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_activities: {
        Row: {
          category: string | null
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          order_index: number
          place_id: string | null
          route_day_id: string
          start_time: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          order_index: number
          place_id?: string | null
          route_day_id: string
          start_time?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          order_index?: number
          place_id?: string | null
          route_day_id?: string
          start_time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_activities_route_day_id_fkey"
            columns: ["route_day_id"]
            isOneToOne: false
            referencedRelation: "route_days"
            referencedColumns: ["id"]
          },
        ]
      }
      route_conversations: {
        Row: {
          conversation_phase: string | null
          created_at: string | null
          id: string
          messages: Json
          route_id: string
          updated_at: string | null
          user_id: string
          user_preferences: Json | null
        }
        Insert: {
          conversation_phase?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          route_id: string
          updated_at?: string | null
          user_id: string
          user_preferences?: Json | null
        }
        Update: {
          conversation_phase?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          route_id?: string
          updated_at?: string | null
          user_id?: string
          user_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "route_conversations_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_days: {
        Row: {
          created_at: string
          date: string | null
          day_number: number
          id: string
          notes: string | null
          route_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          day_number: number
          id?: string
          notes?: string | null
          route_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          day_number?: number
          id?: string
          notes?: string | null
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_days_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_documents: {
        Row: {
          created_at: string
          expiry_date: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          notes: string | null
          route_id: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          notes?: string | null
          route_id: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          notes?: string | null
          route_id?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_documents_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_transports: {
        Row: {
          arrival_datetime: string | null
          arrival_location: string | null
          company: string | null
          confirmation_number: string | null
          created_at: string
          currency: string | null
          departure_datetime: string | null
          departure_location: string | null
          id: string
          notes: string | null
          price: number | null
          route_id: string
          type: string
        }
        Insert: {
          arrival_datetime?: string | null
          arrival_location?: string | null
          company?: string | null
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          departure_datetime?: string | null
          departure_location?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          route_id: string
          type: string
        }
        Update: {
          arrival_datetime?: string | null
          arrival_location?: string | null
          company?: string | null
          confirmation_number?: string | null
          created_at?: string
          currency?: string | null
          departure_datetime?: string | null
          departure_location?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          route_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_transports_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          city: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: string
          number_of_days: number | null
          start_date: string | null
          state: string | null
          status: string | null
          title: string
          travelers: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location: string
          number_of_days?: number | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          title: string
          travelers?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string
          number_of_days?: number | null
          start_date?: string | null
          state?: string | null
          status?: string | null
          title?: string
          travelers?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_cities_with_posts_normalized: {
        Args: { post_type_param?: Database["public"]["Enums"]["post_type"] }
        Returns: {
          city: string
          post_count: number
          state: string
        }[]
      }
      get_comments_with_details: {
        Args: { post_id_param: string; viewer_id_param: string }
        Returns: {
          author_avatar_url: string
          author_full_name: string
          author_id: string
          author_username: string
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_id: string
          post_id: string
          updated_at: string
          user_has_liked: boolean
        }[]
      }
      get_posts_with_details: {
        Args: {
          location_param?: string
          post_type_param?: Database["public"]["Enums"]["post_type"]
          viewer_id_param: string
        }
        Returns: {
          author_avatar_url: string
          author_full_name: string
          author_id: string
          author_username: string
          city: string
          comments_count: number
          content: string
          created_at: string
          id: string
          images: string[]
          likes_count: number
          location: string
          rating: number
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_has_liked: boolean
          user_has_saved: boolean
        }[]
      }
      get_posts_with_details_paginated: {
        Args: {
          limit_param?: number
          location_param?: string
          offset_param?: number
          post_type_param?: Database["public"]["Enums"]["post_type"]
          viewer_id_param: string
        }
        Returns: {
          author_avatar_url: string
          author_full_name: string
          author_id: string
          author_username: string
          city: string
          comments_count: number
          content: string
          created_at: string
          id: string
          images: string[]
          likes_count: number
          location: string
          rating: number
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_has_liked: boolean
          user_has_saved: boolean
        }[]
      }
      get_saved_posts_with_details: {
        Args: { user_id_param: string }
        Returns: {
          author_avatar_url: string
          author_full_name: string
          author_id: string
          author_username: string
          city: string
          comments_count: number
          content: string
          created_at: string
          id: string
          images: string[]
          likes_count: number
          location: string
          rating: number
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_has_liked: boolean
          user_has_saved: boolean
        }[]
      }
      get_saved_posts_with_details_paginated: {
        Args: {
          limit_param?: number
          offset_param?: number
          user_id_param: string
        }
        Returns: {
          author_avatar_url: string
          author_full_name: string
          author_id: string
          author_username: string
          city: string
          comments_count: number
          content: string
          created_at: string
          id: string
          images: string[]
          likes_count: number
          location: string
          rating: number
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_has_liked: boolean
          user_has_saved: boolean
        }[]
      }
      get_user_posts_with_details: {
        Args: { user_id_param: string; viewer_id_param: string }
        Returns: {
          author_avatar_url: string
          author_full_name: string
          author_id: string
          author_username: string
          city: string
          comments_count: number
          content: string
          created_at: string
          id: string
          images: string[]
          likes_count: number
          location: string
          rating: number
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_has_liked: boolean
          user_has_saved: boolean
        }[]
      }
      get_user_posts_with_details_paginated: {
        Args: {
          limit_param?: number
          offset_param?: number
          user_id_param: string
          viewer_id_param: string
        }
        Returns: {
          author_avatar_url: string
          author_full_name: string
          author_id: string
          author_username: string
          city: string
          comments_count: number
          content: string
          created_at: string
          id: string
          images: string[]
          likes_count: number
          location: string
          rating: number
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_has_liked: boolean
          user_has_saved: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      unaccent: { Args: { "": string }; Returns: string }
      unaccent_immutable: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      post_type: "roteiro" | "dica" | "registro"
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
      app_role: ["admin", "moderator", "user"],
      post_type: ["roteiro", "dica", "registro"],
    },
  },
} as const
