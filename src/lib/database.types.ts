export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string | null
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          latitude: number | null
          line1: string
          longitude: number | null
          phone: string | null
          recipient_name: string | null
          user_id: string
        }
        Insert: {
          area?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          latitude?: number | null
          line1: string
          longitude?: number | null
          phone?: string | null
          recipient_name?: string | null
          user_id: string
        }
        Update: {
          area?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          latitude?: number | null
          line1?: string
          longitude?: number | null
          phone?: string | null
          recipient_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          model: string | null
          prompt: Json | null
          provider: string | null
          response: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          model?: string | null
          prompt?: Json | null
          provider?: string | null
          response?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          model?: string | null
          prompt?: Json | null
          provider?: string | null
          response?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_state: Json | null
          previous_state: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carguvi_verifications: {
        Row: {
          availability_discrepancy: boolean
          created_at: string
          enumerator_id: string
          id: string
          notes: string | null
          observed_availability:
            | Database["public"]["Enums"]["availability_status"]
            | null
          observed_price: number | null
          price_discrepancy: boolean
          product_id: string | null
          shop_verified: boolean | null
          task_id: string | null
          vendor_id: string
        }
        Insert: {
          availability_discrepancy?: boolean
          created_at?: string
          enumerator_id: string
          id?: string
          notes?: string | null
          observed_availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          observed_price?: number | null
          price_discrepancy?: boolean
          product_id?: string | null
          shop_verified?: boolean | null
          task_id?: string | null
          vendor_id: string
        }
        Update: {
          availability_discrepancy?: boolean
          created_at?: string
          enumerator_id?: string
          id?: string
          notes?: string | null
          observed_availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          observed_price?: number | null
          price_discrepancy?: boolean
          product_id?: string | null
          shop_verified?: boolean | null
          task_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carguvi_verifications_enumerator_id_fkey"
            columns: ["enumerator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carguvi_verifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carguvi_verifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "verification_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carguvi_verifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          icon: string | null
          id: number
          name: string
          parent_id: number | null
          slug: string
          sort_order: number
        }
        Insert: {
          icon?: string | null
          id?: number
          name: string
          parent_id?: number | null
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string | null
          id?: number
          name?: string
          parent_id?: number | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_vehicles: {
        Row: {
          created_at: string
          engine_id: number | null
          generation_id: number | null
          id: string
          is_primary: boolean
          make_id: number
          model_id: number
          nickname: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          created_at?: string
          engine_id?: number | null
          generation_id?: number | null
          id?: string
          is_primary?: boolean
          make_id: number
          model_id: number
          nickname?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          created_at?: string
          engine_id?: number | null
          generation_id?: number | null
          id?: string
          is_primary?: boolean
          make_id?: number
          model_id?: number
          nickname?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_vehicles_engine_id_fkey"
            columns: ["engine_id"]
            isOneToOne: false
            referencedRelation: "vehicle_engines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "vehicle_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          address_id: string | null
          created_at: string
          distance_km: number | null
          fee: number
          id: string
          provider: string
          status: Database["public"]["Enums"]["delivery_status"]
          tracking_note: string | null
          updated_at: string
          vendor_order_id: string
        }
        Insert: {
          address_id?: string | null
          created_at?: string
          distance_km?: number | null
          fee?: number
          id?: string
          provider?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          tracking_note?: string | null
          updated_at?: string
          vendor_order_id: string
        }
        Update: {
          address_id?: string | null
          created_at?: string
          distance_km?: number | null
          fee?: number
          id?: string
          provider?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          tracking_note?: string | null
          updated_at?: string
          vendor_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_vendor_order_id_fkey"
            columns: ["vendor_order_id"]
            isOneToOne: false
            referencedRelation: "vendor_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string
          dispute_type: Database["public"]["Enums"]["dispute_type"]
          id: string
          order_id: string | null
          resolution: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
          user_id: string
          vendor_id: string | null
          vendor_order_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          dispute_type?: Database["public"]["Enums"]["dispute_type"]
          id?: string
          order_id?: string | null
          resolution?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
          user_id: string
          vendor_id?: string | null
          vendor_order_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          dispute_type?: Database["public"]["Enums"]["dispute_type"]
          id?: string
          order_id?: string | null
          resolution?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
          vendor_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_vendor_order_id_fkey"
            columns: ["vendor_order_id"]
            isOneToOne: false
            referencedRelation: "vendor_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_primary_href: string | null
          cta_primary_label: string | null
          cta_secondary_href: string | null
          cta_secondary_label: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          overlay_opacity: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_primary_href?: string | null
          cta_primary_label?: string | null
          cta_secondary_href?: string | null
          cta_secondary_label?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          overlay_opacity?: number
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_primary_href?: string | null
          cta_primary_label?: string | null
          cta_secondary_href?: string | null
          cta_secondary_label?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          overlay_opacity?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          message: string
          name: string | null
          product_id: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          message: string
          name?: string | null
          product_id?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          message?: string
          name?: string | null
          product_id?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["inventory_event_type"]
          id: string
          new_availability:
            | Database["public"]["Enums"]["availability_status"]
            | null
          new_price: number | null
          note: string | null
          old_availability:
            | Database["public"]["Enums"]["availability_status"]
            | null
          old_price: number | null
          product_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["inventory_event_type"]
          id?: string
          new_availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          new_price?: number | null
          note?: string | null
          old_availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          old_price?: number | null
          product_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["inventory_event_type"]
          id?: string
          new_availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          new_price?: number | null
          note?: string | null
          old_availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          old_price?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          condition: Database["public"]["Enums"]["product_condition"] | null
          id: string
          product_id: string | null
          quantity: number
          title: string
          unit_price: number
          vendor_order_id: string
        }
        Insert: {
          condition?: Database["public"]["Enums"]["product_condition"] | null
          id?: string
          product_id?: string | null
          quantity?: number
          title: string
          unit_price: number
          vendor_order_id: string
        }
        Update: {
          condition?: Database["public"]["Enums"]["product_condition"] | null
          id?: string
          product_id?: string | null
          quantity?: number
          title?: string
          unit_price?: number
          vendor_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_vendor_order_id_fkey"
            columns: ["vendor_order_id"]
            isOneToOne: false
            referencedRelation: "vendor_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_id: string
          customer_note: string | null
          delivery_address_id: string | null
          delivery_fee: number
          id: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id: string
          customer_note?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string
          customer_note?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          created_at: string
          event: string
          id: string
          payload: Json
          payment_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          payload?: Json
          payment_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          payload?: Json
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          method: string | null
          order_id: string
          provider: string
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          order_id: string
          provider?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          order_id?: string
          provider?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      product_compatibility: {
        Row: {
          engine_id: number | null
          generation_id: number | null
          id: string
          make_id: number | null
          model_id: number | null
          product_id: string
          year_end: number | null
          year_start: number | null
        }
        Insert: {
          engine_id?: number | null
          generation_id?: number | null
          id?: string
          make_id?: number | null
          model_id?: number | null
          product_id: string
          year_end?: number | null
          year_start?: number | null
        }
        Update: {
          engine_id?: number | null
          generation_id?: number | null
          id?: string
          make_id?: number | null
          model_id?: number | null
          product_id?: string
          year_end?: number | null
          year_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_compatibility_engine_id_fkey"
            columns: ["engine_id"]
            isOneToOne: false
            referencedRelation: "vehicle_engines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_compatibility_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "vehicle_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_compatibility_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_compatibility_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_compatibility_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_favourites: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_favourites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_favourites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"]
          carguvi_verified_at: string | null
          category_id: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at: string
          currency: string
          delivery_available: boolean
          description: string | null
          id: string
          oem_number: string | null
          part_number: string | null
          pickup_available: boolean
          price: number
          quantity: number | null
          search_text: unknown
          seller_confirmed_at: string | null
          seller_updated_at: string | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          vendor_id: string
          view_count: number
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"]
          carguvi_verified_at?: string | null
          category_id?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          currency?: string
          delivery_available?: boolean
          description?: string | null
          id?: string
          oem_number?: string | null
          part_number?: string | null
          pickup_available?: boolean
          price: number
          quantity?: number | null
          search_text?: unknown
          seller_confirmed_at?: string | null
          seller_updated_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          vendor_id: string
          view_count?: number
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"]
          carguvi_verified_at?: string | null
          category_id?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          currency?: string
          delivery_available?: boolean
          description?: string | null
          id?: string
          oem_number?: string | null
          part_number?: string | null
          pickup_available?: boolean
          price?: number
          quantity?: number | null
          search_text?: unknown
          seller_confirmed_at?: string | null
          seller_updated_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          vendor_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string | null
          product_rating: number | null
          rating: number
          user_id: string
          vendor_id: string
          vendor_order_id: string
          vendor_rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          product_rating?: number | null
          rating: number
          user_id: string
          vendor_id: string
          vendor_order_id: string
          vendor_rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          product_rating?: number | null
          rating?: number
          user_id?: string
          vendor_id?: string
          vendor_order_id?: string
          vendor_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_order_id_fkey"
            columns: ["vendor_order_id"]
            isOneToOne: false
            referencedRelation: "vendor_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      search_events: {
        Row: {
          created_at: string
          filters: Json
          id: string
          query: string
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          query: string
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_confirmations: {
        Row: {
          confirmed_by: string | null
          created_at: string
          id: string
          product_id: string
          response: Database["public"]["Enums"]["confirmation_response"]
          source: string
          vendor_id: string
        }
        Insert: {
          confirmed_by?: string | null
          created_at?: string
          id?: string
          product_id: string
          response: Database["public"]["Enums"]["confirmation_response"]
          source?: string
          vendor_id: string
        }
        Update: {
          confirmed_by?: string | null
          created_at?: string
          id?: string
          product_id?: string
          response?: Database["public"]["Enums"]["confirmation_response"]
          source?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_confirmations_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_confirmations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_confirmations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      sourcing_requests: {
        Row: {
          admin_notes: string | null
          condition_pref: string
          contact: string
          created_at: string
          currency: string
          id: string
          name: string | null
          notes: string | null
          part_name: string
          part_number: string | null
          quantity: number
          quote_amount: number | null
          quote_timeline: string | null
          source_pref: string | null
          status: Database["public"]["Enums"]["sourcing_status"]
          updated_at: string
          user_id: string | null
          vehicle_description: string | null
        }
        Insert: {
          admin_notes?: string | null
          condition_pref?: string
          contact: string
          created_at?: string
          currency?: string
          id?: string
          name?: string | null
          notes?: string | null
          part_name: string
          part_number?: string | null
          quantity?: number
          quote_amount?: number | null
          quote_timeline?: string | null
          source_pref?: string | null
          status?: Database["public"]["Enums"]["sourcing_status"]
          updated_at?: string
          user_id?: string | null
          vehicle_description?: string | null
        }
        Update: {
          admin_notes?: string | null
          condition_pref?: string
          contact?: string
          created_at?: string
          currency?: string
          id?: string
          name?: string | null
          notes?: string | null
          part_name?: string
          part_number?: string | null
          quantity?: number
          quote_amount?: number | null
          quote_timeline?: string | null
          source_pref?: string | null
          status?: Database["public"]["Enums"]["sourcing_status"]
          updated_at?: string
          user_id?: string | null
          vehicle_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sourcing_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_engines: {
        Row: {
          fuel_type: string | null
          generation_id: number | null
          id: number
          model_id: number | null
          name: string
          transmission: string | null
        }
        Insert: {
          fuel_type?: string | null
          generation_id?: number | null
          id?: number
          model_id?: number | null
          name: string
          transmission?: string | null
        }
        Update: {
          fuel_type?: string | null
          generation_id?: number | null
          id?: number
          model_id?: number | null
          name?: string
          transmission?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_engines_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "vehicle_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_engines_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_generations: {
        Row: {
          id: number
          model_id: number
          name: string
          year_end: number | null
          year_start: number | null
        }
        Insert: {
          id?: number
          model_id: number
          name: string
          year_end?: number | null
          year_start?: number | null
        }
        Update: {
          id?: number
          model_id?: number
          name?: string
          year_end?: number | null
          year_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_generations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_makes: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          id: number
          make_id: number
          name: string
        }
        Insert: {
          id?: number
          make_id: number
          name: string
        }
        Update: {
          id?: number
          make_id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_locations: {
        Row: {
          address: string
          area: string | null
          city: string
          created_at: string
          delivery_available: boolean
          id: string
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          name: string
          pickup_available: boolean
          pickup_instructions: string | null
          vendor_id: string
        }
        Insert: {
          address: string
          area?: string | null
          city?: string
          created_at?: string
          delivery_available?: boolean
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          pickup_available?: boolean
          pickup_instructions?: string | null
          vendor_id: string
        }
        Update: {
          address?: string
          area?: string | null
          city?: string
          created_at?: string
          delivery_available?: boolean
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          pickup_available?: boolean
          pickup_instructions?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_locations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_metrics: {
        Row: {
          avg_response_minutes: number | null
          cancellation_rate: number | null
          confirmation_consistency: number | null
          fulfilment_rate: number | null
          stock_accuracy: number | null
          updated_at: string
          vendor_id: string
          verification_consistency: number | null
        }
        Insert: {
          avg_response_minutes?: number | null
          cancellation_rate?: number | null
          confirmation_consistency?: number | null
          fulfilment_rate?: number | null
          stock_accuracy?: number | null
          updated_at?: string
          vendor_id: string
          verification_consistency?: number | null
        }
        Update: {
          avg_response_minutes?: number | null
          cancellation_rate?: number | null
          confirmation_consistency?: number | null
          fulfilment_rate?: number | null
          stock_accuracy?: number | null
          updated_at?: string
          vendor_id?: string
          verification_consistency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_metrics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_orders: {
        Row: {
          created_at: string
          delivery_fee: number
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"]
          id: string
          order_id: string
          pickup_location_id: string | null
          status: Database["public"]["Enums"]["vendor_order_status"]
          subtotal: number
          updated_at: string
          vendor_id: string
          vendor_note: string | null
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          order_id: string
          pickup_location_id?: string | null
          status?: Database["public"]["Enums"]["vendor_order_status"]
          subtotal?: number
          updated_at?: string
          vendor_id: string
          vendor_note?: string | null
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          order_id?: string
          pickup_location_id?: string | null
          status?: Database["public"]["Enums"]["vendor_order_status"]
          subtotal?: number
          updated_at?: string
          vendor_id?: string
          vendor_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_orders_pickup_location_id_fkey"
            columns: ["pickup_location_id"]
            isOneToOne: false
            referencedRelation: "vendor_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_staff: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          permissions: Json
          staff_role: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          staff_role?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          staff_role?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_staff_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          business_documents: Json
          business_name: string
          city: string
          contact_person: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_verified: boolean
          operating_area: string | null
          owner_user_id: string | null
          payment_details: Json
          phone: string | null
          physical_address: string | null
          rating: number | null
          review_count: number
          slug: string
          status: Database["public"]["Enums"]["vendor_status"]
          updated_at: string
          verified_at: string | null
          whatsapp: string | null
        }
        Insert: {
          business_documents?: Json
          business_name: string
          city?: string
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean
          operating_area?: string | null
          owner_user_id?: string | null
          payment_details?: Json
          phone?: string | null
          physical_address?: string | null
          rating?: number | null
          review_count?: number
          slug: string
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          verified_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          business_documents?: Json
          business_name?: string
          city?: string
          contact_person?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean
          operating_area?: string | null
          owner_user_id?: string | null
          payment_details?: Json
          phone?: string | null
          physical_address?: string | null
          rating?: number | null
          review_count?: number
          slug?: string
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          verified_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_photos: {
        Row: {
          created_at: string
          id: string
          url: string
          verification_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          url: string
          verification_id: string
        }
        Update: {
          created_at?: string
          id?: string
          url?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_photos_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "carguvi_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_tasks: {
        Row: {
          assigned_by: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          enumerator_id: string
          id: string
          notes: string | null
          product_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["verification_task_status"]
          task_type: Database["public"]["Enums"]["verification_task_type"]
          vendor_id: string
        }
        Insert: {
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          enumerator_id: string
          id?: string
          notes?: string | null
          product_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["verification_task_status"]
          task_type?: Database["public"]["Enums"]["verification_task_type"]
          vendor_id: string
        }
        Update: {
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          enumerator_id?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["verification_task_status"]
          task_type?: Database["public"]["Enums"]["verification_task_type"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_tasks_enumerator_id_fkey"
            columns: ["enumerator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_tasks_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { r: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_vendor_permission: {
        Args: { p_permission: string; p_vendor_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_enumerator_for_task: { Args: { p_task_id: string }; Returns: boolean }
      is_vendor_member: { Args: { p_vendor_id: string }; Returns: boolean }
      is_vendor_owner: { Args: { p_vendor_id: string }; Returns: boolean }
      vendor_id_from_product: {
        Args: { p_product_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "vendor"
        | "staff"
        | "enumerator"
        | "customer"
      availability_status:
        | "in_stock"
        | "low_stock"
        | "out_of_stock"
        | "available_on_order"
        | "unknown"
      confirmation_response: "available" | "sold" | "updated"
      delivery_status:
        | "pending"
        | "assigned"
        | "picked_up"
        | "in_transit"
        | "delivered"
        | "failed"
        | "cancelled"
      dispute_status: "open" | "under_review" | "resolved" | "closed"
      dispute_type:
        | "wrong_product"
        | "unavailable_product"
        | "damaged_product"
        | "incorrect_description"
        | "incorrect_price"
        | "delivery_problem"
        | "other"
      fulfillment_type: "pickup" | "delivery"
      inquiry_status: "open" | "answered" | "closed"
      inventory_event_type:
        | "created"
        | "price_change"
        | "availability_change"
        | "quantity_change"
        | "seller_confirmed"
        | "carguvi_verified"
        | "sold"
        | "order_reserved"
        | "order_released"
        | "archived"
        | "discrepancy_flagged"
      listing_status: "draft" | "active" | "archived" | "sold"
      order_status:
        | "pending_payment"
        | "payment_failed"
        | "paid"
        | "in_fulfilment"
        | "completed"
        | "partially_completed"
        | "cancelled"
        | "refunded"
        | "disputed"
      payment_status:
        | "initiated"
        | "pending"
        | "confirmed"
        | "failed"
        | "refunded"
      product_condition: "new" | "used" | "refurbished"
      sourcing_status:
        | "requested"
        | "quoting"
        | "quoted"
        | "accepted"
        | "ordered"
        | "in_transit"
        | "arrived"
        | "completed"
        | "cancelled"
      vendor_order_status:
        | "pending_payment"
        | "paid"
        | "accepted"
        | "preparing"
        | "ready_for_pickup"
        | "out_for_delivery"
        | "collected"
        | "delivered"
        | "completed"
        | "rejected"
        | "cancelled"
        | "refunded"
        | "disputed"
      vendor_status: "pending" | "approved" | "suspended" | "rejected"
      verification_task_status:
        | "assigned"
        | "started"
        | "completed"
        | "skipped"
        | "flagged"
      verification_task_type:
        | "shop_check"
        | "product_availability"
        | "price_check"
        | "photo_capture"
        | "follow_up"
        | "discrepancy_review"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "vendor",
        "staff",
        "enumerator",
        "customer",
      ],
      availability_status: [
        "in_stock",
        "low_stock",
        "out_of_stock",
        "available_on_order",
        "unknown",
      ],
      confirmation_response: ["available", "sold", "updated"],
      delivery_status: [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "failed",
        "cancelled",
      ],
      dispute_status: ["open", "under_review", "resolved", "closed"],
      dispute_type: [
        "wrong_product",
        "unavailable_product",
        "damaged_product",
        "incorrect_description",
        "incorrect_price",
        "delivery_problem",
        "other",
      ],
      fulfillment_type: ["pickup", "delivery"],
      inquiry_status: ["open", "answered", "closed"],
      inventory_event_type: [
        "created",
        "price_change",
        "availability_change",
        "quantity_change",
        "seller_confirmed",
        "carguvi_verified",
        "sold",
        "order_reserved",
        "order_released",
        "archived",
        "discrepancy_flagged",
      ],
      listing_status: ["draft", "active", "archived", "sold"],
      order_status: [
        "pending_payment",
        "payment_failed",
        "paid",
        "in_fulfilment",
        "completed",
        "partially_completed",
        "cancelled",
        "refunded",
        "disputed",
      ],
      payment_status: [
        "initiated",
        "pending",
        "confirmed",
        "failed",
        "refunded",
      ],
      product_condition: ["new", "used", "refurbished"],
      sourcing_status: [
        "requested",
        "quoting",
        "quoted",
        "accepted",
        "ordered",
        "in_transit",
        "arrived",
        "completed",
        "cancelled",
      ],
      vendor_order_status: [
        "pending_payment",
        "paid",
        "accepted",
        "preparing",
        "ready_for_pickup",
        "out_for_delivery",
        "collected",
        "delivered",
        "completed",
        "rejected",
        "cancelled",
        "refunded",
        "disputed",
      ],
      vendor_status: ["pending", "approved", "suspended", "rejected"],
      verification_task_status: [
        "assigned",
        "started",
        "completed",
        "skipped",
        "flagged",
      ],
      verification_task_type: [
        "shop_check",
        "product_availability",
        "price_check",
        "photo_capture",
        "follow_up",
        "discrepancy_review",
      ],
    },
  },
} as const
