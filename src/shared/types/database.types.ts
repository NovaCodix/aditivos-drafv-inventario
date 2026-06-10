// =============================================================================
// database.types.ts — Tipos TypeScript inferidos del Schema de Supabase
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MovementType = 'ENTRY' | 'EXIT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT'
export type ReferenceType = 'PURCHASE' | 'SALE' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN' | 'INITIAL' | 'PRODUCTION' | 'MANUFACTURING'
export type StockStatus = 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVER_STOCK'

// ERP Enums
export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED'
export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED' | 'CANCELLED'
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'VOIDED'
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT' | 'CHECK' | 'ONLINE'
export type Currency = 'PEN' | 'USD'
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR' | 'GOVERNMENT' | 'OTHER'
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'
export type RequisitionStatus = 'DRAFT' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED'
export type RequisitionPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED'
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
export type SalesOrderStatus = 'CONFIRMED' | 'PROCESSING' | 'PARTIAL' | 'DELIVERED' | 'CANCELLED'
export type ProductionOrderStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
        }
        Update: {
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      permissions: {
        Row: {
          id: string
          module: string
          action: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          module: string
          action: string
          description?: string | null
        }
        Update: {
          description?: string | null
        }
        Relationships: any[]
      }
      user_roles: {
        Row: {
          user_id: string
          role_id: string
          assigned_at: string
          assigned_by: string | null
        }
        Insert: {
          user_id: string
          role_id: string
          assigned_by?: string | null
        }
        Update: never
      }
      role_permissions: {
        Row: {
          role_id: string
          permission_id: string
        }
        Insert: {
          role_id: string
          permission_id: string
        }
        Update: never
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          slug: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          slug?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          name?: string
          description?: string | null
          parent_id?: string | null
          slug?: string | null
          is_active?: boolean
          sort_order?: number
        }
        Relationships: any[]
      }
      brands: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      unit_measures: {
        Row: {
          id: string
          name: string
          abbreviation: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          abbreviation: string
          description?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          abbreviation?: string
          description?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      products: {
        Row: {
          id: string
          sku: string
          barcode: string | null
          name: string
          description: string | null
          category_id: string | null
          brand_id: string | null
          unit_measure_id: string | null
          purchase_price: number
          sale_price: number
          image_url: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          sku: string
          barcode?: string | null
          name: string
          description?: string | null
          category_id?: string | null
          brand_id?: string | null
          unit_measure_id?: string | null
          purchase_price?: number
          sale_price?: number
          image_url?: string | null
          is_active?: boolean
          notes?: string | null
          created_by?: string | null
        }
        Update: {
          sku?: string
          barcode?: string | null
          name?: string
          description?: string | null
          category_id?: string | null
          brand_id?: string | null
          unit_measure_id?: string | null
          purchase_price?: number
          sale_price?: number
          image_url?: string | null
          is_active?: boolean
          notes?: string | null
        }
        Relationships: any[]
      }
      warehouses: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          phone: string | null
          manager_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          phone?: string | null
          manager_id?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          manager_id?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      locations: {
        Row: {
          id: string
          warehouse_id: string
          code: string
          aisle: string | null
          rack: string | null
          level: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          warehouse_id: string
          code: string
          aisle?: string | null
          rack?: string | null
          level?: string | null
          description?: string | null
          is_active?: boolean
        }
        Update: {
          code?: string
          aisle?: string | null
          rack?: string | null
          level?: string | null
          description?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      batches: {
        Row: {
          id: string
          product_id: string
          batch_number: string
          manufacture_date: string | null
          expiration_date: string | null
          quantity: number
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          product_id: string
          batch_number: string
          manufacture_date?: string | null
          expiration_date?: string | null
          quantity?: number
          notes?: string | null
          is_active?: boolean
          created_by?: string | null
        }
        Update: {
          batch_number?: string
          manufacture_date?: string | null
          expiration_date?: string | null
          quantity?: number
          notes?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          quantity: number
          reserved_quantity: number
          minimum_stock: number
          maximum_stock: number | null
          location_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse_id: string
          quantity?: number
          reserved_quantity?: number
          minimum_stock?: number
          maximum_stock?: number | null
          location_id?: string | null
        }
        Update: {
          quantity?: number
          reserved_quantity?: number
          minimum_stock?: number
          maximum_stock?: number | null
          location_id?: string | null
        }
        Relationships: any[]
      }
      inventory_movements: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          batch_id: string | null
          location_id: string | null
          movement_type: MovementType
          quantity: number
          stock_before: number
          stock_after: number
          unit_cost: number | null
          reference_type: ReferenceType | null
          reference_id: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse_id: string
          batch_id?: string | null
          location_id?: string | null
          movement_type: MovementType
          quantity: number
          stock_before: number
          stock_after: number
          unit_cost?: number | null
          reference_type?: ReferenceType | null
          reference_id?: string | null
          notes?: string | null
          created_by?: string | null
        }
        Update: never // IMMUTABLE — Kardex
      }
      suppliers: {
        Row: {
          id: string
          business_name: string
          ruc: string | null
          contact_name: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          country: string | null
          website: string | null
          credit_days: number | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          business_name: string
          ruc?: string | null
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          website?: string | null
          credit_days?: number | null
          notes?: string | null
          is_active?: boolean
          created_by?: string | null
        }
        Update: {
          business_name?: string
          ruc?: string | null
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          website?: string | null
          credit_days?: number | null
          notes?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }

      // ── ERP: CLIENTES ──────────────────────────────────────────────────────
      customers: {
        Row: {
          id: string
          business_name: string
          ruc: string | null
          contact_name: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          country: string
          customer_type: CustomerType
          credit_days: number
          credit_limit: number
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          business_name: string
          ruc?: string | null
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          country?: string
          customer_type?: CustomerType
          credit_days?: number
          credit_limit?: number
          notes?: string | null
          is_active?: boolean
          created_by?: string | null
        }
        Update: {
          business_name?: string
          ruc?: string | null
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          country?: string
          customer_type?: CustomerType
          credit_days?: number
          credit_limit?: number
          notes?: string | null
          is_active?: boolean
        }
        Relationships: any[]
      }

      // ── ERP: COMPRAS ────────────────────────────────────────────────────────
      purchase_requisitions: {
        Row: {
          id: string
          code: string
          requested_by: string
          status: RequisitionStatus
          priority: RequisitionPriority
          needed_by: string | null
          notes: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          requested_by: string
          status?: RequisitionStatus
          priority?: RequisitionPriority
          needed_by?: string | null
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          status?: RequisitionStatus
          priority?: RequisitionPriority
          needed_by?: string | null
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Relationships: any[]
      }
      purchase_requisition_items: {
        Row: {
          id: string
          requisition_id: string
          product_id: string
          quantity_requested: number
          quantity_approved: number | null
          unit_price_ref: number | null
          notes: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          requisition_id: string
          product_id: string
          quantity_requested: number
          quantity_approved?: number | null
          unit_price_ref?: number | null
          notes?: string | null
          sort_order?: number
        }
        Update: {
          quantity_requested?: number
          quantity_approved?: number | null
          unit_price_ref?: number | null
          notes?: string | null
        }
        Relationships: any[]
      }
      purchase_orders: {
        Row: {
          id: string
          code: string
          supplier_id: string
          requisition_id: string | null
          status: PurchaseOrderStatus
          expected_date: string | null
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          currency: Currency
          exchange_rate: number
          notes: string | null
          approved_by: string | null
          approved_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          supplier_id: string
          requisition_id?: string | null
          status?: PurchaseOrderStatus
          expected_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          currency?: Currency
          exchange_rate?: number
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          created_by?: string | null
        }
        Update: {
          status?: PurchaseOrderStatus
          expected_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Relationships: any[]
      }
      purchase_order_details: {
        Row: {
          id: string
          purchase_order_id: string
          product_id: string
          quantity_ordered: number
          quantity_received: number
          unit_price: number
          discount_pct: number
          subtotal: number
          sort_order: number
        }
        Insert: {
          id?: string
          purchase_order_id: string
          product_id: string
          quantity_ordered: number
          quantity_received?: number
          unit_price: number
          discount_pct?: number
          subtotal?: number
          sort_order?: number
        }
        Update: {
          quantity_received?: number
          unit_price?: number
          discount_pct?: number
          subtotal?: number
        }
        Relationships: any[]
      }
      goods_receipts: {
        Row: {
          id: string
          code: string
          purchase_order_id: string
          warehouse_id: string
          receipt_date: string
          status: string
          notes: string | null
          received_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          purchase_order_id: string
          warehouse_id: string
          receipt_date?: string
          status?: string
          notes?: string | null
          received_by?: string | null
        }
        Update: {
          status?: string
          notes?: string | null
          received_by?: string | null
        }
        Relationships: any[]
      }
      goods_receipt_items: {
        Row: {
          id: string
          goods_receipt_id: string
          purchase_order_detail_id: string | null
          product_id: string
          batch_id: string | null
          quantity_received: number
          unit_cost: number
          movement_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goods_receipt_id: string
          purchase_order_detail_id?: string | null
          product_id: string
          batch_id?: string | null
          quantity_received: number
          unit_cost?: number
          movement_id?: string | null
        }
        Update: {
          quantity_received?: number
          unit_cost?: number
          movement_id?: string | null
        }
        Relationships: any[]
      }

      // ── ERP: VENTAS ─────────────────────────────────────────────────────────
      quotations: {
        Row: {
          id: string
          code: string
          customer_id: string
          status: QuotationStatus
          valid_until: string | null
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          currency: Currency
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          customer_id: string
          status?: QuotationStatus
          valid_until?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          currency?: Currency
          notes?: string | null
          created_by?: string | null
        }
        Update: {
          status?: QuotationStatus
          valid_until?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
        }
        Relationships: any[]
      }
      quotation_items: {
        Row: {
          id: string
          quotation_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount_pct: number
          subtotal: number
          sort_order: number
        }
        Insert: {
          id?: string
          quotation_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount_pct?: number
          subtotal?: number
          sort_order?: number
        }
        Update: {
          quantity?: number
          unit_price?: number
          discount_pct?: number
          subtotal?: number
        }
        Relationships: any[]
      }
      sales_orders: {
        Row: {
          id: string
          code: string
          customer_id: string
          quotation_id: string | null
          status: SalesOrderStatus
          delivery_date: string | null
          warehouse_id: string | null
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          currency: Currency
          notes: string | null
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          customer_id: string
          quotation_id?: string | null
          status?: SalesOrderStatus
          delivery_date?: string | null
          warehouse_id?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          currency?: Currency
          notes?: string | null
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          status?: SalesOrderStatus
          delivery_date?: string | null
          warehouse_id?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Relationships: any[]
      }
      sales_order_details: {
        Row: {
          id: string
          sales_order_id: string
          product_id: string
          quantity_ordered: number
          quantity_delivered: number
          unit_price: number
          discount_pct: number
          subtotal: number
          sort_order: number
        }
        Insert: {
          id?: string
          sales_order_id: string
          product_id: string
          quantity_ordered: number
          quantity_delivered?: number
          unit_price: number
          discount_pct?: number
          subtotal?: number
          sort_order?: number
        }
        Update: {
          quantity_delivered?: number
          unit_price?: number
          discount_pct?: number
          subtotal?: number
        }
        Relationships: any[]
      }
      deliveries: {
        Row: {
          id: string
          code: string
          sales_order_id: string
          warehouse_id: string
          delivery_date: string
          status: DeliveryStatus
          notes: string | null
          delivered_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          sales_order_id: string
          warehouse_id: string
          delivery_date?: string
          status?: DeliveryStatus
          notes?: string | null
          delivered_by?: string | null
        }
        Update: {
          status?: DeliveryStatus
          notes?: string | null
          delivered_by?: string | null
        }
        Relationships: any[]
      }
      delivery_items: {
        Row: {
          id: string
          delivery_id: string
          sales_order_detail_id: string | null
          product_id: string
          batch_id: string | null
          quantity_delivered: number
          unit_price: number
          movement_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          delivery_id: string
          sales_order_detail_id?: string | null
          product_id: string
          batch_id?: string | null
          quantity_delivered: number
          unit_price?: number
          movement_id?: string | null
        }
        Update: {
          quantity_delivered?: number
          unit_price?: number
          movement_id?: string | null
        }
        Relationships: any[]
      }

      // ── ERP: MANUFACTURA ────────────────────────────────────────────────────
      bill_of_materials: {
        Row: {
          id: string
          product_id: string
          name: string
          version: string
          output_quantity: number
          unit_measure_id: string | null
          is_active: boolean
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          version?: string
          output_quantity?: number
          unit_measure_id?: string | null
          is_active?: boolean
          notes?: string | null
          created_by?: string | null
        }
        Update: {
          name?: string
          version?: string
          output_quantity?: number
          unit_measure_id?: string | null
          is_active?: boolean
          notes?: string | null
        }
        Relationships: any[]
      }
      bill_of_material_items: {
        Row: {
          id: string
          bom_id: string
          product_id: string
          quantity: number
          unit_measure_id: string | null
          is_optional: boolean
          scrap_pct: number
          notes: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          bom_id: string
          product_id: string
          quantity: number
          unit_measure_id?: string | null
          is_optional?: boolean
          scrap_pct?: number
          notes?: string | null
          sort_order?: number
        }
        Update: {
          quantity?: number
          unit_measure_id?: string | null
          is_optional?: boolean
          scrap_pct?: number
          notes?: string | null
        }
        Relationships: any[]
      }
      production_orders: {
        Row: {
          id: string
          code: string
          bom_id: string
          warehouse_id: string
          status: ProductionOrderStatus
          quantity_planned: number
          quantity_produced: number
          planned_start: string | null
          planned_end: string | null
          actual_start: string | null
          actual_end: string | null
          notes: string | null
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          bom_id: string
          warehouse_id: string
          status?: ProductionOrderStatus
          quantity_planned: number
          quantity_produced?: number
          planned_start?: string | null
          planned_end?: string | null
          actual_start?: string | null
          actual_end?: string | null
          notes?: string | null
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          status?: ProductionOrderStatus
          quantity_produced?: number
          planned_start?: string | null
          planned_end?: string | null
          actual_start?: string | null
          actual_end?: string | null
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Relationships: any[]
      }
      production_order_consumptions: {
        Row: {
          id: string
          production_order_id: string
          product_id: string
          batch_id: string | null
          quantity_planned: number
          quantity_consumed: number
          unit_cost: number | null
          movement_id: string | null
          consumed_at: string | null
          consumed_by: string | null
        }
        Insert: {
          id?: string
          production_order_id: string
          product_id: string
          batch_id?: string | null
          quantity_planned: number
          quantity_consumed?: number
          unit_cost?: number | null
          movement_id?: string | null
          consumed_at?: string | null
          consumed_by?: string | null
        }
        Update: {
          quantity_consumed?: number
          unit_cost?: number | null
          movement_id?: string | null
          consumed_at?: string | null
          consumed_by?: string | null
        }
        Relationships: any[]
      }
      production_order_outputs: {
        Row: {
          id: string
          production_order_id: string
          product_id: string
          batch_id: string | null
          quantity_produced: number
          unit_cost: number | null
          movement_id: string | null
          produced_at: string | null
          produced_by: string | null
        }
        Insert: {
          id?: string
          production_order_id: string
          product_id: string
          batch_id?: string | null
          quantity_produced: number
          unit_cost?: number | null
          movement_id?: string | null
          produced_at?: string | null
          produced_by?: string | null
        }
        Update: {
          quantity_produced?: number
          unit_cost?: number | null
          movement_id?: string | null
          produced_at?: string | null
          produced_by?: string | null
        }
        Relationships: any[]
      }

      // ── ERP: FACTURACIÓN ────────────────────────────────────────────────────
      invoices: {
        Row: {
          id: string
          invoice_series: string
          invoice_number: string
          customer_id: string
          sales_order_id: string | null
          status: InvoiceStatus
          issue_date: string
          due_date: string | null
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          currency: Currency
          exchange_rate: number
          payment_method: PaymentMethod
          paid_at: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_series?: string
          invoice_number: string
          customer_id: string
          sales_order_id?: string | null
          status?: InvoiceStatus
          issue_date?: string
          due_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          currency?: Currency
          exchange_rate?: number
          payment_method?: PaymentMethod
          paid_at?: string | null
          notes?: string | null
          created_by?: string | null
        }
        Update: {
          status?: InvoiceStatus
          due_date?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          payment_method?: PaymentMethod
          paid_at?: string | null
          notes?: string | null
        }
        Relationships: any[]
      }
      invoice_details: {
        Row: {
          id: string
          invoice_id: string
          product_id: string | null
          description: string
          quantity: number
          unit_price: number
          discount_pct: number
          tax_rate: number
          subtotal: number
          tax_amount: number
          total: number
          sort_order: number
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id?: string | null
          description: string
          quantity: number
          unit_price: number
          discount_pct?: number
          tax_rate?: number
          subtotal?: number
          tax_amount?: number
          total?: number
          sort_order?: number
        }
        Update: {
          description?: string
          quantity?: number
          unit_price?: number
          discount_pct?: number
          tax_rate?: number
          subtotal?: number
          tax_amount?: number
          total?: number
        }
        Relationships: any[]
      }

      // ── ERP: AUDITORÍA ──────────────────────────────────────────────────────
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: AuditAction
          old_values: Record<string, unknown> | null
          new_values: Record<string, unknown> | null
          user_id: string | null
          module: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: AuditAction
          old_values?: Record<string, unknown> | null
          new_values?: Record<string, unknown> | null
          user_id?: string | null
          module?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: Record<string, never>
        Relationships: any[]
      }

      // ── ERP: SECUENCIAS ─────────────────────────────────────────────────────
      sequence_counters: {
        Row: {
          module: string
          prefix: string
          current_value: number
          year_prefix: boolean
        }
        Insert: {
          module: string
          prefix: string
          current_value?: number
          year_prefix?: boolean
        }
        Update: {
          current_value?: number
        }
        Relationships: any[]
      }
    }
    Views: {
      v_inventory_summary: {
        Row: {
          id: string
          product_id: string
          sku: string
          product_name: string
          barcode: string | null
          warehouse_id: string
          warehouse_name: string
          quantity: number
          reserved_quantity: number
          available_quantity: number
          minimum_stock: number
          maximum_stock: number | null
          stock_status: StockStatus
          unit: string | null
          category_name: string | null
          brand_name: string | null
        }
      }
      v_low_stock: {
        Row: {
          id: string
          product_id: string
          sku: string
          product_name: string
          warehouse_id: string
          warehouse_name: string
          quantity: number
          minimum_stock: number
          stock_status: StockStatus
          unit: string | null
        }
      }
      v_purchase_orders: {
        Row: {
          id: string
          code: string
          status: PurchaseOrderStatus
          expected_date: string | null
          total: number
          currency: Currency
          created_at: string
          supplier_name: string
          supplier_ruc: string | null
          created_by_name: string | null
          items_count: number
          total_received: number
        }
      }
      v_sales_orders: {
        Row: {
          id: string
          code: string
          status: SalesOrderStatus
          delivery_date: string | null
          total: number
          currency: Currency
          created_at: string
          customer_name: string
          customer_ruc: string | null
          warehouse_name: string | null
          created_by_name: string | null
          items_count: number
        }
      }
      v_production_orders: {
        Row: {
          id: string
          code: string
          status: ProductionOrderStatus
          quantity_planned: number
          quantity_produced: number
          planned_start: string | null
          planned_end: string | null
          actual_start: string | null
          actual_end: string | null
          created_at: string
          bom_name: string
          bom_version: string
          product_name: string
          product_sku: string
          warehouse_name: string
          created_by_name: string | null
          completion_pct: number | null
        }
      }
      v_invoices: {
        Row: {
          id: string
          invoice_series: string
          invoice_number: string
          full_number: string
          status: InvoiceStatus
          issue_date: string
          due_date: string | null
          total: number
          currency: Currency
          payment_method: PaymentMethod
          paid_at: string | null
          customer_name: string
          customer_ruc: string | null
          created_by_name: string | null
          is_overdue: boolean
        }
      }
    }
    Functions: {
      register_inventory_movement: {
        Args: {
          p_product_id: string
          p_warehouse_id: string
          p_batch_id: string | null
          p_location_id: string | null
          p_movement_type: MovementType
          p_quantity: number
          p_unit_cost: number | null
          p_reference_type: ReferenceType | null
          p_reference_id: string | null
          p_notes: string | null
          p_created_by: string | null
        }
        Returns: string
      }
      user_has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { p_module: string; p_action: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      next_document_code: {
        Args: { p_module: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =============================================================================
// Tipos derivados de conveniencia
// =============================================================================
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile          = Tables<'profiles'>
export type Role             = Tables<'roles'>
export type Permission       = Tables<'permissions'>
export type Category         = Tables<'categories'>
export type Brand            = Tables<'brands'>
export type UnitMeasure      = Tables<'unit_measures'>
export type Product          = Tables<'products'>
export type Warehouse        = Tables<'warehouses'>
export type Location         = Tables<'locations'>
export type Batch            = Tables<'batches'>
export type Inventory        = Tables<'inventory'>
export type InventoryMovement = Tables<'inventory_movements'>
export type Supplier         = Tables<'suppliers'>
export type InventorySummary = Database['public']['Views']['v_inventory_summary']['Row']

// ERP convenience types
export type Customer                    = Tables<'customers'>
export type PurchaseRequisition         = Tables<'purchase_requisitions'>
export type PurchaseRequisitionItem     = Tables<'purchase_requisition_items'>
export type PurchaseOrder               = Tables<'purchase_orders'>
export type PurchaseOrderDetail         = Tables<'purchase_order_details'>
export type GoodsReceipt                = Tables<'goods_receipts'>
export type GoodsReceiptItem            = Tables<'goods_receipt_items'>
export type Quotation                   = Tables<'quotations'>
export type QuotationItem               = Tables<'quotation_items'>
export type SalesOrder                  = Tables<'sales_orders'>
export type SalesOrderDetail            = Tables<'sales_order_details'>
export type Delivery                    = Tables<'deliveries'>
export type DeliveryItem                = Tables<'delivery_items'>
export type BillOfMaterials             = Tables<'bill_of_materials'>
export type BillOfMaterialItem          = Tables<'bill_of_material_items'>
export type ProductionOrder             = Tables<'production_orders'>
export type ProductionOrderConsumption  = Tables<'production_order_consumptions'>
export type ProductionOrderOutput       = Tables<'production_order_outputs'>
export type Invoice                     = Tables<'invoices'>
export type InvoiceDetail               = Tables<'invoice_details'>
export type AuditLog                    = Tables<'audit_logs'>

// ERP view types
export type PurchaseOrderView   = Database['public']['Views']['v_purchase_orders']['Row']
export type SalesOrderView      = Database['public']['Views']['v_sales_orders']['Row']
export type ProductionOrderView = Database['public']['Views']['v_production_orders']['Row']
export type InvoiceView         = Database['public']['Views']['v_invoices']['Row']

