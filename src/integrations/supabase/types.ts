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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_email: string
          author_name: string
          blog_post_id: string
          content: string
          created_at: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          status: string | null
        }
        Insert: {
          author_email: string
          author_name: string
          blog_post_id: string
          content: string
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          status?: string | null
        }
        Update: {
          author_email?: string
          author_name?: string
          blog_post_id?: string
          content?: string
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_name: string
          author_role: string | null
          category: string | null
          content: string
          cover_image: string | null
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          id: string
          published: boolean | null
          published_at: string | null
          read_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          author_role?: string | null
          category?: string | null
          content: string
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          author_role?: string | null
          category?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_order: number | null
          id: string
          logo_url: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          logo_url: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          logo_url?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      catalog_inquiries: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          message: string
          share_link_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          message: string
          share_link_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          message?: string
          share_link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_inquiries_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_orders: {
        Row: {
          admin_notes: string | null
          budget_range: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          design_description: string
          gemstone_preference: string | null
          id: string
          metal_type: string | null
          reference_images: string[] | null
          share_link_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          budget_range?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          design_description: string
          gemstone_preference?: string | null
          id?: string
          metal_type?: string | null
          reference_images?: string[] | null
          share_link_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          budget_range?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          design_description?: string
          gemstone_preference?: string | null
          id?: string
          metal_type?: string | null
          reference_images?: string[] | null
          share_link_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_orders_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      diamond_price_history: {
        Row: {
          carat_range_max: number
          carat_range_min: number
          change_type: string
          changed_at: string
          changed_by: string | null
          clarity_grade: string
          color_grade: string
          currency: string
          cut_grade: string
          id: string
          new_price_per_carat: number
          notes: string | null
          old_price_per_carat: number | null
          price_id: string
          shape: string
        }
        Insert: {
          carat_range_max: number
          carat_range_min: number
          change_type: string
          changed_at?: string
          changed_by?: string | null
          clarity_grade: string
          color_grade: string
          currency?: string
          cut_grade: string
          id?: string
          new_price_per_carat: number
          notes?: string | null
          old_price_per_carat?: number | null
          price_id: string
          shape: string
        }
        Update: {
          carat_range_max?: number
          carat_range_min?: number
          change_type?: string
          changed_at?: string
          changed_by?: string | null
          clarity_grade?: string
          color_grade?: string
          currency?: string
          cut_grade?: string
          id?: string
          new_price_per_carat?: number
          notes?: string | null
          old_price_per_carat?: number | null
          price_id?: string
          shape?: string
        }
        Relationships: []
      }
      diamond_prices: {
        Row: {
          carat_range_max: number
          carat_range_min: number
          clarity_grade: string
          color_grade: string
          created_at: string
          currency: string
          cut_grade: string
          id: string
          notes: string | null
          price_per_carat: number
          shape: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          carat_range_max: number
          carat_range_min: number
          clarity_grade: string
          color_grade: string
          created_at?: string
          currency?: string
          cut_grade: string
          id?: string
          notes?: string | null
          price_per_carat: number
          shape: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          carat_range_max?: number
          carat_range_min?: number
          clarity_grade?: string
          color_grade?: string
          created_at?: string
          currency?: string
          cut_grade?: string
          id?: string
          notes?: string | null
          price_per_carat?: number
          shape?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
          unsubscribe_token: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribe_token?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribe_token?: string | null
        }
        Relationships: []
      }
      permission_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          template_config: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          template_config: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          template_config?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      points_history: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          expired: boolean | null
          expires_at: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          expired?: boolean | null
          expires_at?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          expired?: boolean | null
          expires_at?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      press_releases: {
        Row: {
          content: string
          created_at: string | null
          external_url: string | null
          featured: boolean | null
          id: string
          publication: string | null
          publication_logo: string | null
          published_date: string
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          external_url?: string | null
          featured?: boolean | null
          id?: string
          publication?: string | null
          publication_logo?: string | null
          published_date: string
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          external_url?: string | null
          featured?: boolean | null
          id?: string
          publication?: string | null
          publication_logo?: string | null
          published_date?: string
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_interests: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          product_id: string
          share_link_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          product_id: string
          share_link_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          share_link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_interests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_interests_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          carat: number | null
          carat_weight: number | null
          category: string | null
          certification: string | null
          certification_cost: number | null
          clarity: string | null
          color: string | null
          color_shade_amount: string | null
          cost_price: number
          created_at: string | null
          cut: string | null
          d_rate_1: number | null
          d_value: number | null
          d_wt_1: number | null
          d_wt_2: number | null
          deleted_at: string | null
          delivery_type: string | null
          description: string | null
          diamond_color: string | null
          diamond_type: string | null
          diamond_weight: number | null
          dispatches_in_days: number | null
          fluorescence: string | null
          gemstone: string | null
          gemstone_cost: number | null
          gemstone_name: string | null
          gemstone_type: string | null
          gold_per_gram_price: number | null
          id: string
          image_url: string | null
          image_url_2: string | null
          image_url_3: string | null
          lab: string | null
          measurement: string | null
          metal_type: string | null
          mkg: number | null
          name: string
          net_weight: number | null
          per_carat_price: number | null
          pointer_diamond: number | null
          polish: string | null
          price_inr: number | null
          price_usd: number | null
          product_type: string | null
          purity_fraction_used: number | null
          ratio: string | null
          retail_price: number
          shape: string | null
          sku: string | null
          status: string | null
          stock_quantity: number | null
          symmetry: string | null
          total_usd: number | null
          updated_at: string | null
          user_id: string
          weight_grams: number | null
        }
        Insert: {
          carat?: number | null
          carat_weight?: number | null
          category?: string | null
          certification?: string | null
          certification_cost?: number | null
          clarity?: string | null
          color?: string | null
          color_shade_amount?: string | null
          cost_price: number
          created_at?: string | null
          cut?: string | null
          d_rate_1?: number | null
          d_value?: number | null
          d_wt_1?: number | null
          d_wt_2?: number | null
          deleted_at?: string | null
          delivery_type?: string | null
          description?: string | null
          diamond_color?: string | null
          diamond_type?: string | null
          diamond_weight?: number | null
          dispatches_in_days?: number | null
          fluorescence?: string | null
          gemstone?: string | null
          gemstone_cost?: number | null
          gemstone_name?: string | null
          gemstone_type?: string | null
          gold_per_gram_price?: number | null
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          lab?: string | null
          measurement?: string | null
          metal_type?: string | null
          mkg?: number | null
          name: string
          net_weight?: number | null
          per_carat_price?: number | null
          pointer_diamond?: number | null
          polish?: string | null
          price_inr?: number | null
          price_usd?: number | null
          product_type?: string | null
          purity_fraction_used?: number | null
          ratio?: string | null
          retail_price: number
          shape?: string | null
          sku?: string | null
          status?: string | null
          stock_quantity?: number | null
          symmetry?: string | null
          total_usd?: number | null
          updated_at?: string | null
          user_id: string
          weight_grams?: number | null
        }
        Update: {
          carat?: number | null
          carat_weight?: number | null
          category?: string | null
          certification?: string | null
          certification_cost?: number | null
          clarity?: string | null
          color?: string | null
          color_shade_amount?: string | null
          cost_price?: number
          created_at?: string | null
          cut?: string | null
          d_rate_1?: number | null
          d_value?: number | null
          d_wt_1?: number | null
          d_wt_2?: number | null
          deleted_at?: string | null
          delivery_type?: string | null
          description?: string | null
          diamond_color?: string | null
          diamond_type?: string | null
          diamond_weight?: number | null
          dispatches_in_days?: number | null
          fluorescence?: string | null
          gemstone?: string | null
          gemstone_cost?: number | null
          gemstone_name?: string | null
          gemstone_type?: string | null
          gold_per_gram_price?: number | null
          id?: string
          image_url?: string | null
          image_url_2?: string | null
          image_url_3?: string | null
          lab?: string | null
          measurement?: string | null
          metal_type?: string | null
          mkg?: number | null
          name?: string
          net_weight?: number | null
          per_carat_price?: number | null
          pointer_diamond?: number | null
          polish?: string | null
          price_inr?: number | null
          price_usd?: number | null
          product_type?: string | null
          purity_fraction_used?: number | null
          ratio?: string | null
          retail_price?: number
          shape?: string | null
          sku?: string | null
          status?: string | null
          stock_quantity?: number | null
          symmetry?: string | null
          total_usd?: number | null
          updated_at?: string | null
          user_id?: string
          weight_grams?: number | null
        }
        Relationships: []
      }
      purchase_inquiries: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          message: string | null
          product_id: string
          quantity: number | null
          share_link_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          message?: string | null
          product_id: string
          quantity?: number | null
          share_link_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          message?: string | null
          product_id?: string
          quantity?: number | null
          share_link_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_inquiries_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          applied_at: string | null
          expires_at: string | null
          id: string
          points_spent: number
          redeemed_at: string | null
          reward_details: Json | null
          reward_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          expires_at?: string | null
          id?: string
          points_spent: number
          redeemed_at?: string | null
          reward_details?: Json | null
          reward_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          expires_at?: string | null
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          reward_details?: Json | null
          reward_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_catalog: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_cost: number
          reward_type: string
          reward_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_cost: number
          reward_type: string
          reward_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_cost?: number
          reward_type?: string
          reward_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      scratch_leads: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string
          id: string
          interest: string | null
          name: string
          phone: string | null
          session_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          interest?: string | null
          name: string
          phone?: string | null
          session_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          interest?: string | null
          name?: string
          phone?: string | null
          session_id?: string
        }
        Relationships: []
      }
      scratch_rewards: {
        Row: {
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          id: string
          reward_type: string
          reward_value: string
          session_id: string
        }
        Insert: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          reward_type: string
          reward_value: string
          session_id: string
        }
        Update: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          reward_type?: string
          reward_value?: string
          session_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      share_link_product_views: {
        Row: {
          id: string
          product_id: string
          share_link_id: string
          viewed_at: string
          viewer_ip: string | null
          viewer_user_agent: string | null
        }
        Insert: {
          id?: string
          product_id: string
          share_link_id: string
          viewed_at?: string
          viewer_ip?: string | null
          viewer_user_agent?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          share_link_id?: string
          viewed_at?: string
          viewer_ip?: string | null
          viewer_user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_link_product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_link_product_views_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          markdown_percentage: number | null
          markup_percentage: number | null
          share_token: string
          shared_categories: string[] | null
          show_vendor_details: boolean
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          markdown_percentage?: number | null
          markup_percentage?: number | null
          share_token?: string
          shared_categories?: string[] | null
          show_vendor_details?: boolean
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          markdown_percentage?: number | null
          markup_percentage?: number | null
          share_token?: string
          shared_categories?: string[] | null
          show_vendor_details?: boolean
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      user_approval_status: {
        Row: {
          approved_categories: string[] | null
          business_name: string | null
          email: string | null
          id: string
          is_enabled: boolean | null
          notes: string | null
          phone: string | null
          rejection_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
          user_id: string
        }
        Insert: {
          approved_categories?: string[] | null
          business_name?: string | null
          email?: string | null
          id?: string
          is_enabled?: boolean | null
          notes?: string | null
          phone?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          user_id: string
        }
        Update: {
          approved_categories?: string[] | null
          business_name?: string | null
          email?: string | null
          id?: string
          is_enabled?: boolean | null
          notes?: string | null
          phone?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          user_id?: string
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
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          id: string
          ip_address: string | null
          last_activity: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_activity?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_milestones: {
        Row: {
          achieved_at: string
          id: string
          milestone_type: string
          milestone_value: number
          points_awarded: number
          user_id: string
        }
        Insert: {
          achieved_at?: string
          id?: string
          milestone_type: string
          milestone_value: number
          points_awarded?: number
          user_id: string
        }
        Update: {
          achieved_at?: string
          id?: string
          milestone_type?: string
          milestone_value?: number
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      vendor_permissions: {
        Row: {
          can_add_products: boolean | null
          can_add_vendor_details: boolean | null
          can_delete_products: boolean | null
          can_edit_products: boolean | null
          can_edit_profile: boolean | null
          can_import_data: boolean | null
          can_manage_custom_orders: boolean | null
          can_manage_sessions: boolean | null
          can_manage_share_links: boolean | null
          can_manage_team: boolean | null
          can_share_catalog: boolean | null
          can_view_catalog: boolean | null
          can_view_custom_orders: boolean | null
          can_view_interests: boolean | null
          can_view_sessions: boolean | null
          can_view_share_links: boolean | null
          created_at: string | null
          id: string
          max_active_sessions: number
          max_product_images: number | null
          max_products: number | null
          max_share_links: number | null
          max_team_members: number | null
          override_plan_limits: boolean | null
          plan_updated_at: string | null
          plan_updated_by: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_add_products?: boolean | null
          can_add_vendor_details?: boolean | null
          can_delete_products?: boolean | null
          can_edit_products?: boolean | null
          can_edit_profile?: boolean | null
          can_import_data?: boolean | null
          can_manage_custom_orders?: boolean | null
          can_manage_sessions?: boolean | null
          can_manage_share_links?: boolean | null
          can_manage_team?: boolean | null
          can_share_catalog?: boolean | null
          can_view_catalog?: boolean | null
          can_view_custom_orders?: boolean | null
          can_view_interests?: boolean | null
          can_view_sessions?: boolean | null
          can_view_share_links?: boolean | null
          created_at?: string | null
          id?: string
          max_active_sessions?: number
          max_product_images?: number | null
          max_products?: number | null
          max_share_links?: number | null
          max_team_members?: number | null
          override_plan_limits?: boolean | null
          plan_updated_at?: string | null
          plan_updated_by?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_add_products?: boolean | null
          can_add_vendor_details?: boolean | null
          can_delete_products?: boolean | null
          can_edit_products?: boolean | null
          can_edit_profile?: boolean | null
          can_import_data?: boolean | null
          can_manage_custom_orders?: boolean | null
          can_manage_sessions?: boolean | null
          can_manage_share_links?: boolean | null
          can_manage_team?: boolean | null
          can_share_catalog?: boolean | null
          can_view_catalog?: boolean | null
          can_view_custom_orders?: boolean | null
          can_view_interests?: boolean | null
          can_view_sessions?: boolean | null
          can_view_share_links?: boolean | null
          created_at?: string | null
          id?: string
          max_active_sessions?: number
          max_product_images?: number | null
          max_products?: number | null
          max_share_links?: number | null
          max_team_members?: number | null
          override_plan_limits?: boolean | null
          plan_updated_at?: string | null
          plan_updated_by?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendor_points: {
        Row: {
          created_at: string
          current_tier: string
          id: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_tier?: string
          id?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_tier?: string
          id?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          awards: string[] | null
          business_name: string | null
          business_story: string | null
          certifications: string[] | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          gold_rate_24k_per_gram: number | null
          gold_rate_updated_at: string | null
          id: string
          instagram_qr_url: string | null
          logo_url: string | null
          phone: string | null
          pincode: string | null
          seller_categories: string[] | null
          state: string | null
          updated_at: string | null
          user_id: string
          whatsapp_number: string | null
          whatsapp_qr_url: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          awards?: string[] | null
          business_name?: string | null
          business_story?: string | null
          certifications?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          gold_rate_24k_per_gram?: number | null
          gold_rate_updated_at?: string | null
          id?: string
          instagram_qr_url?: string | null
          logo_url?: string | null
          phone?: string | null
          pincode?: string | null
          seller_categories?: string[] | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_number?: string | null
          whatsapp_qr_url?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          awards?: string[] | null
          business_name?: string | null
          business_story?: string | null
          certifications?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          gold_rate_24k_per_gram?: number | null
          gold_rate_updated_at?: string | null
          id?: string
          instagram_qr_url?: string | null
          logo_url?: string | null
          phone?: string | null
          pincode?: string | null
          seller_categories?: string[] | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_number?: string | null
          whatsapp_qr_url?: string | null
        }
        Relationships: []
      }
      video_requests: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          product_id: string | null
          requested_products: string
          share_link_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          product_id?: string | null
          requested_products: string
          share_link_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          product_id?: string | null
          requested_products?: string
          share_link_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_requests_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          added_at: string
          id: string
          notes: string | null
          product_id: string
          share_link_id: string | null
          wishlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          notes?: string | null
          product_id: string
          share_link_id?: string | null
          wishlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          share_link_id?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          session_id: string | null
          share_token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          session_id?: string | null
          share_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          session_id?: string | null
          share_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_sessions: { Args: never; Returns: undefined }
      get_active_points: { Args: { user_id_param: string }; Returns: number }
      get_expiring_points: {
        Args: { user_id_param: string }
        Returns: {
          expires_at: string
          points: number
        }[]
      }
      hard_delete_products: {
        Args: { product_ids: string[] }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
      log_audit: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "team_member"
      approval_status: "pending" | "approved" | "rejected"
      subscription_plan: "starter" | "professional" | "enterprise"
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
      app_role: ["admin", "team_member"],
      approval_status: ["pending", "approved", "rejected"],
      subscription_plan: ["starter", "professional", "enterprise"],
    },
  },
} as const
