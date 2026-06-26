CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE OR REPLACE FUNCTION public.fn_create_profile_for_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_create_profile ON auth.users;

CREATE TRIGGER trg_auth_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_create_profile_for_new_user();

CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, table_name, record_id, action, old_values, new_values, ip_address
  )
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::TEXT,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'INSERTAR'
      WHEN TG_OP = 'UPDATE' THEN 'ACTUALIZAR'
      WHEN TG_OP = 'DELETE' THEN 'ELIMINAR'
    END,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::JSONB END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::JSONB END,
    current_setting('request.headers', TRUE)::JSONB->>'x-forwarded-for'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_prevent_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('supabase_admin', 'postgres', 'service_role') THEN
    RETURN OLD;
  END IF;

  IF current_setting('role', true) = 'service_role' THEN
    RETURN OLD;
  END IF;

  RAISE EXCEPTION 'Eliminación física no permitida. Use eliminación lógica actualizando deleted_at.';
END;
$$;

CREATE TYPE public.movement_type_enum AS ENUM ('ENTRADA', 'SALIDA', 'TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA', 'AJUSTE');
CREATE TYPE public.reference_type_enum AS ENUM ('COMPRA', 'VENTA', 'TRANSFERENCIA', 'AJUSTE', 'DEVOLUCION', 'INICIAL', 'PRODUCCION', 'MANUFACTURA');
CREATE TYPE public.order_status_enum AS ENUM ('DRAFT', 'CONFIRMED', 'PROCESSING', 'IN_PROGRESS', 'PARTIAL', 'COMPLETED', 'DELIVERED', 'RECEIVED', 'CANCELLED', 'SENT');
CREATE TYPE public.delivery_status_enum AS ENUM ('PENDING', 'EN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED');
CREATE TYPE public.invoice_status_enum AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED', 'VOIDED');
CREATE TYPE public.payment_method_enum AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'CREDITO', 'CHEQUE', 'ONLINE');
CREATE TYPE public.currency_enum AS ENUM ('PEN', 'USD');
CREATE TYPE public.customer_type_enum AS ENUM ('MINORISTA', 'MAYORISTA', 'DISTRIBUIDOR', 'GOBIERNO', 'OTRO');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_profiles_email_unique ON public.profiles(email) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_roles_name_unique ON public.roles(name) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_user_roles_unique ON public.user_roles(user_id, role_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_categories_slug_unique ON public.categories(slug) WHERE deleted_at IS NULL AND slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_brands_name_unique ON public.brands(name) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.unit_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_um_name_unique ON public.unit_measures(name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_um_abbr_unique ON public.unit_measures(abbreviation) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  barcode TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  unit_measure_id UUID REFERENCES public.unit_measures(id) ON DELETE RESTRICT,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_products_sku_unique ON public.products(sku) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_products_barcode_unique ON public.products(barcode) WHERE deleted_at IS NULL AND barcode IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_warehouses_name_unique ON public.warehouses(name) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  aisle TEXT,
  rack TEXT,
  level TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_locations_unique ON public.locations(warehouse_id, code) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_number TEXT NOT NULL,
  manufacture_date DATE,
  expiration_date DATE,
  quantity NUMERIC(12, 3) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_batches_unique ON public.batches(product_id, batch_number) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 3) NOT NULL DEFAULT 0,
  reserved_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0,
  minimum_stock NUMERIC(12, 3) NOT NULL DEFAULT 0,
  maximum_stock NUMERIC(12, 3),
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_inventory_unique ON public.inventory(product_id, warehouse_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  movement_type public.movement_type_enum NOT NULL,
  quantity NUMERIC(12, 3) NOT NULL,
  stock_before NUMERIC(12, 3) NOT NULL,
  stock_after NUMERIC(12, 3) NOT NULL,
  unit_cost NUMERIC(12, 2),
  reference_type public.reference_type_enum,
  reference_id UUID,
  notes TEXT,
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  ruc TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Perú',
  website TEXT,
  credit_days INTEGER DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_suppliers_ruc_unique ON public.suppliers(ruc) WHERE deleted_at IS NULL AND ruc IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  ruc TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'Perú',
  customer_type public.customer_type_enum NOT NULL DEFAULT 'MINORISTA',
  credit_days INTEGER NOT NULL DEFAULT 0,
  credit_limit NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_customers_ruc_unique ON public.customers(ruc) WHERE deleted_at IS NULL AND ruc IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.purchase_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  needed_by DATE,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_purchase_req_code_unique ON public.purchase_requisitions(code) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.purchase_requisition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID NOT NULL REFERENCES public.purchase_requisitions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_requested NUMERIC(12, 3) NOT NULL CHECK (quantity_requested > 0),
  quantity_approved NUMERIC(12, 3),
  unit_price_ref NUMERIC(12, 2),
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  requisition_id UUID REFERENCES public.purchase_requisitions(id) ON DELETE SET NULL,
  status public.order_status_enum NOT NULL DEFAULT 'DRAFT',
  expected_date DATE,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency public.currency_enum NOT NULL DEFAULT 'PEN',
  exchange_rate NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_po_code_unique ON public.purchase_orders(code) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.purchase_order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_ordered NUMERIC(12, 3) NOT NULL CHECK (quantity_ordered > 0),
  quantity_received NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit_price NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
  discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 100),
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  notes TEXT,
  received_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_gr_code_unique ON public.goods_receipts(code) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  purchase_order_detail_id UUID REFERENCES public.purchase_order_details(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  quantity_received NUMERIC(12, 3) NOT NULL CHECK (quantity_received > 0),
  unit_cost NUMERIC(12, 4) NOT NULL DEFAULT 0,
  movement_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  valid_until DATE,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency public.currency_enum NOT NULL DEFAULT 'PEN',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_quotations_code_unique ON public.quotations(code) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
  discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  status public.order_status_enum NOT NULL DEFAULT 'CONFIRMED',
  delivery_date DATE,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency public.currency_enum NOT NULL DEFAULT 'PEN',
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_so_code_unique ON public.sales_orders(code) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.sales_order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_ordered NUMERIC(12, 3) NOT NULL CHECK (quantity_ordered > 0),
  quantity_delivered NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit_price NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
  discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.delivery_status_enum NOT NULL DEFAULT 'DELIVERED',
  notes TEXT,
  delivered_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_deliveries_code_unique ON public.deliveries(code) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  sales_order_detail_id UUID REFERENCES public.sales_order_details(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  quantity_delivered NUMERIC(12, 3) NOT NULL CHECK (quantity_delivered > 0),
  unit_price NUMERIC(12, 4) NOT NULL DEFAULT 0,
  movement_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.bill_of_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  output_quantity NUMERIC(12, 3) NOT NULL DEFAULT 1 CHECK (output_quantity > 0),
  unit_measure_id UUID REFERENCES public.unit_measures(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_bom_unique ON public.bill_of_materials(product_id, version) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.bill_of_material_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 5) NOT NULL CHECK (quantity > 0),
  unit_measure_id UUID REFERENCES public.unit_measures(id) ON DELETE RESTRICT,
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  scrap_pct NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (scrap_pct BETWEEN 0 AND 100),
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_bom_items_unique ON public.bill_of_material_items(bom_id, product_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  bom_id UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  status public.order_status_enum NOT NULL DEFAULT 'DRAFT',
  quantity_planned NUMERIC(12, 3) NOT NULL CHECK (quantity_planned > 0),
  quantity_produced NUMERIC(12, 3) NOT NULL DEFAULT 0,
  planned_start DATE,
  planned_end DATE,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_production_orders_code_unique ON public.production_orders(code) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.production_order_consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  quantity_planned NUMERIC(12, 3) NOT NULL,
  quantity_consumed NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12, 4),
  movement_id UUID,
  consumed_at TIMESTAMPTZ,
  consumed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.production_order_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  quantity_produced NUMERIC(12, 3) NOT NULL CHECK (quantity_produced > 0),
  unit_cost NUMERIC(12, 4),
  movement_id UUID,
  produced_at TIMESTAMPTZ,
  produced_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_series TEXT NOT NULL DEFAULT 'F001',
  invoice_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  status public.invoice_status_enum NOT NULL DEFAULT 'DRAFT',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency public.currency_enum NOT NULL DEFAULT 'PEN',
  exchange_rate NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  payment_method public.payment_method_enum NOT NULL DEFAULT 'EFECTIVO',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);
CREATE UNIQUE INDEX idx_invoices_unique ON public.invoices(invoice_series, invoice_number) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.invoice_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
  discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL CHECK(action IN ('INSERTAR', 'ACTUALIZAR', 'ELIMINAR')),
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE RULE no_update_movements AS ON UPDATE TO public.inventory_movements DO INSTEAD NOTHING;
CREATE RULE no_delete_movements AS ON DELETE TO public.inventory_movements DO INSTEAD NOTHING;
CREATE RULE no_update_audit_logs AS ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit_logs AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_locations_warehouse ON public.locations(warehouse_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_batches_product ON public.batches(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_batches_expiration ON public.batches(expiration_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON public.inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movements_product ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_warehouse ON public.inventory_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_purchase_req_status ON public.purchase_requisitions(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_po_supplier ON public.purchase_orders(supplier_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gr_purchase_order ON public.goods_receipts(purchase_order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON public.quotations(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_so_customer ON public.sales_orders(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON public.deliveries(sales_order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bom_product ON public.bill_of_materials(product_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prod_orders_bom ON public.production_orders(bom_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_table ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

CREATE OR REPLACE VIEW public.v_inventory_summary AS
SELECT
  i.id,
  i.product_id,
  p.sku,
  p.name AS product_name,
  p.barcode,
  i.warehouse_id,
  w.name AS warehouse_name,
  i.quantity,
  i.reserved_quantity,
  (i.quantity - i.reserved_quantity) AS available_quantity,
  i.minimum_stock,
  i.maximum_stock,
  CASE
    WHEN i.quantity = 0 THEN 'OUT_OF_STOCK'
    WHEN i.quantity <= i.minimum_stock THEN 'LOW_STOCK'
    WHEN i.maximum_stock IS NOT NULL AND i.quantity >= i.maximum_stock THEN 'OVER_STOCK'
    ELSE 'OK'
  END AS stock_status,
  um.abbreviation AS unit,
  c.name AS category_name,
  b.name AS brand_name
FROM public.inventory i
JOIN public.products p ON p.id = i.product_id
JOIN public.warehouses w ON w.id = i.warehouse_id
LEFT JOIN public.unit_measures um ON um.id = p.unit_measure_id
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.brands b ON b.id = p.brand_id
WHERE p.deleted_at IS NULL 
  AND w.deleted_at IS NULL 
  AND i.deleted_at IS NULL 
  AND p.is_active = TRUE 
  AND w.is_active = TRUE;

CREATE OR REPLACE VIEW public.v_low_stock AS
SELECT * FROM public.v_inventory_summary
WHERE stock_status IN ('LOW_STOCK', 'OUT_OF_STOCK')
ORDER BY quantity ASC;

CREATE OR REPLACE VIEW public.v_purchase_orders AS
SELECT
  po.id,
  po.code,
  po.status,
  po.expected_date,
  po.total,
  po.currency,
  po.created_at,
  po.supplier_id,
  s.business_name AS supplier_name,
  s.ruc AS supplier_ruc,
  pr.full_name AS created_by_name,
  (SELECT COUNT(*)::INTEGER FROM public.purchase_order_details pod WHERE pod.purchase_order_id = po.id AND pod.deleted_at IS NULL) AS items_count,
  (SELECT COALESCE(SUM(pod.quantity_received), 0)::NUMERIC FROM public.purchase_order_details pod WHERE pod.purchase_order_id = po.id AND pod.deleted_at IS NULL) AS total_received
FROM public.purchase_orders po
JOIN public.suppliers s ON s.id = po.supplier_id
LEFT JOIN public.profiles pr ON pr.id = po.created_by
WHERE po.deleted_at IS NULL AND s.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.v_sales_orders AS
SELECT
  so.id,
  so.code,
  so.status,
  so.delivery_date,
  so.total,
  so.currency,
  so.created_at,
  so.customer_id,
  c.business_name AS customer_name,
  c.ruc AS customer_ruc,
  w.name AS warehouse_name,
  pr.full_name AS created_by_name,
  (SELECT COUNT(*)::INTEGER FROM public.sales_order_details sod WHERE sod.sales_order_id = so.id AND sod.deleted_at IS NULL) AS items_count
FROM public.sales_orders so
JOIN public.customers c ON c.id = so.customer_id
LEFT JOIN public.warehouses w ON w.id = so.warehouse_id
LEFT JOIN public.profiles pr ON pr.id = so.created_by
WHERE so.deleted_at IS NULL AND c.deleted_at IS NULL AND (w.id IS NULL OR w.deleted_at IS NULL);

CREATE OR REPLACE VIEW public.v_production_orders AS
SELECT
  po.id,
  po.code,
  po.status,
  po.quantity_planned,
  po.quantity_produced,
  po.planned_start,
  po.planned_end,
  po.actual_start,
  po.actual_end,
  po.created_at,
  po.warehouse_id,
  bom.name AS bom_name,
  bom.version AS bom_version,
  p.name AS product_name,
  p.sku AS product_sku,
  w.name AS warehouse_name,
  pr.full_name AS created_by_name,
  ROUND((po.quantity_produced / NULLIF(po.quantity_planned, 0)) * 100, 2) AS completion_pct
FROM public.production_orders po
JOIN public.bill_of_materials bom ON bom.id = po.bom_id
JOIN public.products p ON p.id = bom.product_id
JOIN public.warehouses w ON w.id = po.warehouse_id
LEFT JOIN public.profiles pr ON pr.id = po.created_by
WHERE po.deleted_at IS NULL AND bom.deleted_at IS NULL AND p.deleted_at IS NULL AND w.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.v_invoices AS
SELECT
  i.id,
  i.invoice_series,
  i.invoice_number,
  i.invoice_series || '-' || i.invoice_number AS full_number,
  i.status,
  i.issue_date,
  i.due_date,
  i.total,
  i.currency,
  i.payment_method,
  i.paid_at,
  i.customer_id,
  c.business_name AS customer_name,
  c.ruc AS customer_ruc,
  pr.full_name AS created_by_name,
  CASE
    WHEN i.status = 'ISSUED'::public.invoice_status_enum AND i.due_date < CURRENT_DATE THEN TRUE
    ELSE FALSE
  END AS is_overdue
FROM public.invoices i
JOIN public.customers c ON c.id = i.customer_id
LEFT JOIN public.profiles pr ON pr.id = i.created_by
WHERE i.deleted_at IS NULL AND c.deleted_at IS NULL;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'roles', 'user_roles', 'categories', 'brands', 'unit_measures',
    'products', 'warehouses', 'locations', 'batches', 'inventory',
    'suppliers', 'customers', 'purchase_requisitions', 'purchase_requisition_items',
    'purchase_orders', 'purchase_order_details', 'goods_receipts', 'goods_receipt_items',
    'quotations', 'quotation_items', 'sales_orders', 'sales_order_details', 'deliveries',
    'delivery_items', 'bill_of_materials', 'bill_of_material_items', 'production_orders',
    'production_order_consumptions', 'production_order_outputs', 'invoices', 'invoice_details'
  ] LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%s_timestamp
      BEFORE UPDATE ON public.%s
      FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();
    ', t, t);

    EXECUTE format('
      CREATE TRIGGER trg_%s_audit
      AFTER INSERT OR UPDATE OR DELETE ON public.%s
      FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();
    ', t, t);
    
    EXECUTE format('
      CREATE TRIGGER trg_%s_prevent_delete
      BEFORE DELETE ON public.%s
      FOR EACH ROW EXECUTE FUNCTION public.fn_prevent_delete();
    ', t, t);
    
    EXECUTE format('ALTER TABLE public.%s ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.fn_has_permission(p_module TEXT, p_action TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE v_has_perm BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.is_active = TRUE
      AND r.deleted_at IS NULL
      AND (r.permissions->p_module->>p_action)::BOOLEAN = TRUE
  ) INTO v_has_perm;
  RETURN COALESCE(v_has_perm, FALSE);
END;
$$;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'categories', 'brands', 'unit_measures',
    'products', 'warehouses', 'locations', 'batches', 'inventory',
    'suppliers', 'customers', 'purchase_requisitions', 'purchase_requisition_items',
    'purchase_orders', 'purchase_order_details', 'goods_receipts', 'goods_receipt_items',
    'quotations', 'quotation_items', 'sales_orders', 'sales_order_details', 'deliveries',
    'delivery_items', 'bill_of_materials', 'bill_of_material_items', 'production_orders',
    'production_order_consumptions', 'production_order_outputs', 'invoices', 'invoice_details'
  ] LOOP
    
    EXECUTE format('
      CREATE POLICY "auth_read_%s" ON public.%s FOR SELECT TO authenticated 
      USING (deleted_at IS NULL OR fn_has_permission(''%s'', ''leer_eliminados''));
    ', t, t, t);

    EXECUTE format('
      CREATE POLICY "admin_insert_%s" ON public.%s FOR INSERT TO authenticated 
      WITH CHECK (fn_has_permission(''%s'', ''crear'') AND created_by = auth.uid());
    ', t, t, t);

    EXECUTE format('
      CREATE POLICY "admin_update_%s" ON public.%s FOR UPDATE TO authenticated 
      USING (fn_has_permission(''%s'', ''editar'')) 
      WITH CHECK (fn_has_permission(''%s'', ''editar'') AND (deleted_at IS NULL OR (fn_has_permission(''%s'', ''eliminar'') AND deleted_by = auth.uid())));
    ', t, t, t, t, t);

  END LOOP;
END $$;

CREATE POLICY "auth_read_roles_public" ON public.roles FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "admin_insert_roles" ON public.roles FOR INSERT TO authenticated WITH CHECK (fn_has_permission('roles', 'crear') AND created_by = auth.uid());
CREATE POLICY "admin_update_roles" ON public.roles FOR UPDATE TO authenticated USING (fn_has_permission('roles', 'editar')) WITH CHECK (fn_has_permission('roles', 'editar') AND (deleted_at IS NULL OR (fn_has_permission('roles', 'eliminar') AND deleted_by = auth.uid())));

CREATE POLICY "auth_read_user_roles_public" ON public.user_roles FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "admin_insert_user_roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (fn_has_permission('user_roles', 'crear') AND created_by = auth.uid());
CREATE POLICY "admin_update_user_roles" ON public.user_roles FOR UPDATE TO authenticated USING (fn_has_permission('user_roles', 'editar')) WITH CHECK (fn_has_permission('user_roles', 'editar') AND (deleted_at IS NULL OR (fn_has_permission('user_roles', 'eliminar') AND deleted_by = auth.uid())));

CREATE POLICY "auth_read_audit" ON public.audit_logs FOR SELECT TO authenticated USING (fn_has_permission('auditoria', 'leer'));
CREATE POLICY "auth_read_movements" ON public.inventory_movements FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admin_insert_movements" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (fn_has_permission('inventory_movements', 'crear'));

INSERT INTO public.roles (name, description, permissions) VALUES
(
  'Super Administrador', 'Acceso total al ERP',
  '{
    "profiles": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "roles": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "user_roles": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "categories": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "brands": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "unit_measures": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "products": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "warehouses": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "locations": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "batches": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "inventory": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "suppliers": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "customers": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "purchase_requisitions": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "purchase_requisition_items": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "purchase_orders": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "purchase_order_details": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "goods_receipts": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "goods_receipt_items": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "quotations": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "quotation_items": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "sales_orders": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "sales_order_details": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "deliveries": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "delivery_items": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "bill_of_materials": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "bill_of_material_items": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "production_orders": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "production_order_consumptions": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "production_order_outputs": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "invoices": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "invoice_details": {"leer":true,"crear":true,"editar":true,"eliminar":true},
    "inventory_movements": {"leer":true,"crear":true},
    "auditoria": {"leer":true}
  }'::jsonb
),
(
  'Jefe de Almacén', 'Gestión de inventarios y recepciones',
  '{
    "categories": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "brands": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "unit_measures": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "products": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "warehouses": {"leer":true,"crear":false,"editar":true,"eliminar":false},
    "locations": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "batches": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "inventory": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "goods_receipts": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "goods_receipt_items": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "deliveries": {"leer":true,"crear":false,"editar":true,"eliminar":false},
    "delivery_items": {"leer":true,"crear":false,"editar":true,"eliminar":false},
    "inventory_movements": {"leer":true,"crear":true}
  }'::jsonb
),
(
  'Ventas', 'Gestión comercial y clientes',
  '{
    "customers": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "products": {"leer":true,"crear":false,"editar":false,"eliminar":false},
    "inventory": {"leer":true,"crear":false,"editar":false,"eliminar":false},
    "quotations": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "quotation_items": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "sales_orders": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "sales_order_details": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "invoices": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "invoice_details": {"leer":true,"crear":true,"editar":true,"eliminar":false}
  }'::jsonb
),
(
  'Compras', 'Gestión de proveedores y abastecimiento',
  '{
    "suppliers": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "products": {"leer":true,"crear":false,"editar":false,"eliminar":false},
    "inventory": {"leer":true,"crear":false,"editar":false,"eliminar":false},
    "purchase_requisitions": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "purchase_requisition_items": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "purchase_orders": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "purchase_order_details": {"leer":true,"crear":true,"editar":true,"eliminar":false}
  }'::jsonb
),
(
  'Producción', 'Gestión de manufactura y fórmulas',
  '{
    "products": {"leer":true,"crear":false,"editar":false,"eliminar":false},
    "inventory": {"leer":true,"crear":false,"editar":false,"eliminar":false},
    "bill_of_materials": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "bill_of_material_items": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "production_orders": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "production_order_consumptions": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "production_order_outputs": {"leer":true,"crear":true,"editar":true,"eliminar":false},
    "inventory_movements": {"leer":true,"crear":true}
  }'::jsonb
);


GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;
