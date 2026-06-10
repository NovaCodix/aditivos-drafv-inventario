-- ==========================================================================================
-- SISTEMA DE INVENTARIO Y ERP "ADITIVOS DRAFV"
-- SCRIPT 01: ESQUEMA PRINCIPAL Y SEGURIDAD (RLS)
-- ==========================================================================================
-- INSTRUCCIONES DE EJECUCIÓN:
-- 1. Abre el SQL Editor en Supabase.
-- 2. Copia y pega TODO el contenido de este archivo y ejecútalo.
-- 3. Este archivo creará todas las tablas, vistas, funciones, triggers y políticas de seguridad.
-- 4. Una vez ejecutado con éxito, procede a ejecutar el archivo "02_DB_SEED.sql".
--
-- NOTA PARA EL EQUIPO:
-- Este script consolida la versión 1.0 (Inventario Base) y la versión 2.0 (Extensión ERP).
-- Todo está organizado en los siguientes módulos lógicos:
--
-- [1] CORE & AUTH: Perfiles, roles, permisos (Autenticación y Autorización).
-- [2] INVENTARIO BASE: Productos, categorías, almacenes, ubicaciones, lotes y Kardex (inventory_movements).
-- [3] ERP - CLIENTES: Directorio de clientes y créditos.
-- [4] ERP - COMPRAS: Requisiciones, Órdenes de Compra y Recepciones (Goods Receipts -> Kardex).
-- [5] ERP - VENTAS: Cotizaciones, Órdenes de Venta y Entregas (Deliveries -> Kardex).
-- [6] ERP - MANUFACTURA: Listas de Materiales (BOM), Órdenes de Producción, Consumos y Outputs.
-- [7] ERP - FACTURACIÓN: Emisión de facturas y control de pagos.
-- [8] ERP - AUDITORÍA: Registro inmutable de acciones (INSERT/UPDATE/DELETE) en el sistema.
-- [9] SEGURIDAD (RLS): Políticas de acceso por fila basadas en roles para TODAS las tablas.
-- ==========================================================================================

-- =============================================================================
-- INVENTARIO ADITIVOS DRAFV — Schema PostgreSQL para Supabase
-- Versión: 1.0.0
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- FUNCIÓN HELPER: updated_at trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLA: profiles (extiende auth.users de Supabase)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLA: roles
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLA: permissions
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module      TEXT NOT NULL,
  action      TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module, action)
);

-- =============================================================================
-- TABLA: user_roles (relación N:M usuarios y roles)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES public.profiles(id),
  PRIMARY KEY (user_id, role_id)
);

-- =============================================================================
-- TABLA: role_permissions (relación N:M roles y permisos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id       UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- =============================================================================
-- TABLA: categories (árbol jerárquico de categorías)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug        TEXT UNIQUE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- =============================================================================
-- TABLA: brands
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  website     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLA: unit_measures
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.unit_measures (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER unit_measures_updated_at
  BEFORE UPDATE ON public.unit_measures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLA: products
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT NOT NULL UNIQUE,
  barcode         TEXT UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id        UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  unit_measure_id UUID REFERENCES public.unit_measures(id) ON DELETE RESTRICT,
  purchase_price  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sale_price      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image_url       TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES public.profiles(id)
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_products_sku        ON public.products(sku);
CREATE INDEX idx_products_barcode    ON public.products(barcode);
CREATE INDEX idx_products_category   ON public.products(category_id);
CREATE INDEX idx_products_brand      ON public.products(brand_id);
CREATE INDEX idx_products_is_active  ON public.products(is_active);

-- =============================================================================
-- TABLA: warehouses (almacenes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  address     TEXT,
  phone       TEXT,
  manager_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLA: locations (ubicaciones dentro de almacén)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.locations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  code         TEXT NOT NULL,
  aisle        TEXT,
  rack         TEXT,
  level        TEXT,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(warehouse_id, code)
);

CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_locations_warehouse ON public.locations(warehouse_id);

-- =============================================================================
-- TABLA: batches (lotes — trazabilidad para aditivos químicos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.batches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_number     TEXT NOT NULL,
  manufacture_date DATE,
  expiration_date  DATE,
  quantity         NUMERIC(12, 3) NOT NULL DEFAULT 0,
  notes            TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by       UUID REFERENCES public.profiles(id),
  UNIQUE(product_id, batch_number)
);

CREATE TRIGGER batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_batches_product    ON public.batches(product_id);
CREATE INDEX idx_batches_expiration ON public.batches(expiration_date);

-- =============================================================================
-- TABLA: inventory (stock actual por producto/almacén)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.inventory (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id      UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  quantity          NUMERIC(12, 3) NOT NULL DEFAULT 0,
  reserved_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0,
  minimum_stock     NUMERIC(12, 3) NOT NULL DEFAULT 0,
  maximum_stock     NUMERIC(12, 3),
  location_id       UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_inventory_product   ON public.inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON public.inventory(warehouse_id);
CREATE INDEX idx_inventory_low_stock ON public.inventory(quantity) WHERE quantity > 0;

-- =============================================================================
-- TABLA: inventory_movements (KARDEX — append-only, nunca modificar)
-- =============================================================================

CREATE TYPE movement_type_enum AS ENUM (
  'ENTRY',
  'EXIT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'ADJUSTMENT'
);

CREATE TYPE reference_type_enum AS ENUM (
  'PURCHASE',
  'SALE',
  'TRANSFER',
  'ADJUSTMENT',
  'RETURN',
  'INITIAL'
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  warehouse_id   UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  batch_id       UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  location_id    UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  movement_type  movement_type_enum NOT NULL,
  quantity       NUMERIC(12, 3) NOT NULL,
  stock_before   NUMERIC(12, 3) NOT NULL,
  stock_after    NUMERIC(12, 3) NOT NULL,
  unit_cost      NUMERIC(12, 2),
  reference_type reference_type_enum,
  reference_id   UUID,
  notes          TEXT,
  created_by     UUID REFERENCES public.profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IMPORTANTE: inventory_movements es APPEND-ONLY
-- No permitir UPDATE ni DELETE sobre esta tabla
CREATE RULE no_update_movements AS ON UPDATE TO public.inventory_movements DO INSTEAD NOTHING;
CREATE RULE no_delete_movements AS ON DELETE TO public.inventory_movements DO INSTEAD NOTHING;

CREATE INDEX idx_movements_product   ON public.inventory_movements(product_id);
CREATE INDEX idx_movements_warehouse ON public.inventory_movements(warehouse_id);
CREATE INDEX idx_movements_batch     ON public.inventory_movements(batch_id);
CREATE INDEX idx_movements_type      ON public.inventory_movements(movement_type);
CREATE INDEX idx_movements_created   ON public.inventory_movements(created_at DESC);

-- =============================================================================
-- TABLA: suppliers (proveedores)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name  TEXT NOT NULL,
  ruc            TEXT UNIQUE,
  contact_name   TEXT,
  phone          TEXT,
  email          TEXT,
  address        TEXT,
  city           TEXT,
  country        TEXT DEFAULT 'Perú',
  website        TEXT,
  credit_days    INTEGER DEFAULT 0,
  notes          TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     UUID REFERENCES public.profiles(id)
);

CREATE TRIGGER suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_suppliers_ruc    ON public.suppliers(ruc);
CREATE INDEX idx_suppliers_active ON public.suppliers(is_active);

-- =============================================================================
-- VISTA: v_inventory_summary (stock actual con info de producto)
-- =============================================================================
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
WHERE p.is_active = TRUE AND w.is_active = TRUE;

-- =============================================================================
-- VISTA: v_low_stock (productos con stock bajo)
-- =============================================================================
CREATE OR REPLACE VIEW public.v_low_stock AS
SELECT * FROM public.v_inventory_summary
WHERE stock_status IN ('LOW_STOCK', 'OUT_OF_STOCK')
ORDER BY quantity ASC;

-- =============================================================================
-- FUNCIÓN: registrar movimiento de inventario (transaccional)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.register_inventory_movement(
  p_product_id     UUID,
  p_warehouse_id   UUID,
  p_batch_id       UUID,
  p_location_id    UUID,
  p_movement_type  movement_type_enum,
  p_quantity       NUMERIC,
  p_unit_cost      NUMERIC,
  p_reference_type reference_type_enum,
  p_reference_id   UUID,
  p_notes          TEXT,
  p_created_by     UUID
) RETURNS UUID AS $$
DECLARE
  v_current_stock  NUMERIC;
  v_new_stock      NUMERIC;
  v_movement_id    UUID;
  v_direction      INTEGER;
BEGIN
  -- Determinar dirección del movimiento
  v_direction := CASE p_movement_type
    WHEN 'ENTRY'        THEN 1
    WHEN 'EXIT'         THEN -1
    WHEN 'TRANSFER_IN'  THEN 1
    WHEN 'TRANSFER_OUT' THEN -1
    WHEN 'ADJUSTMENT'   THEN 1
    ELSE 0
  END;

  -- Obtener stock actual con lock
  SELECT COALESCE(quantity, 0)
  INTO v_current_stock
  FROM public.inventory
  WHERE product_id = p_product_id
    AND warehouse_id = p_warehouse_id
  FOR UPDATE;

  -- Si no existe registro de inventario, crear uno
  IF NOT FOUND THEN
    INSERT INTO public.inventory (product_id, warehouse_id, quantity)
    VALUES (p_product_id, p_warehouse_id, 0);
    v_current_stock := 0;
  END IF;

  -- Calcular nuevo stock
  v_new_stock := v_current_stock + (v_direction * p_quantity);

  -- Validar que no quede stock negativo
  IF v_new_stock < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente. Stock actual: %, Cantidad solicitada: %',
      v_current_stock, p_quantity;
  END IF;

  -- Registrar movimiento en Kardex
  INSERT INTO public.inventory_movements (
    product_id, warehouse_id, batch_id, location_id,
    movement_type, quantity, stock_before, stock_after,
    unit_cost, reference_type, reference_id, notes, created_by
  ) VALUES (
    p_product_id, p_warehouse_id, p_batch_id, p_location_id,
    p_movement_type, p_quantity, v_current_stock, v_new_stock,
    p_unit_cost, p_reference_type, p_reference_id, p_notes, p_created_by
  ) RETURNING id INTO v_movement_id;

  -- Actualizar stock en inventario
  UPDATE public.inventory
  SET quantity = v_new_stock, updated_at = NOW()
  WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;

  RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCIÓN: auto-crear perfil al registrar usuario
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- INVENTARIO ADITIVOS DRAFV — Extensión ERP v2.0
-- Módulos: Compras, Ventas, Manufactura, Facturación, Auditoría
-- IMPORTANTE: Ejecutar DESPUÉS de schema.sql (v1.0)
-- =============================================================================

-- =============================================================================
-- EXTENDER ENUMs existentes
-- =============================================================================
-- Agregar 'PRODUCTION' y 'MANUFACTURING' a reference_type_enum
ALTER TYPE public.reference_type_enum ADD VALUE IF NOT EXISTS 'PRODUCTION';
ALTER TYPE public.reference_type_enum ADD VALUE IF NOT EXISTS 'MANUFACTURING';

-- =============================================================================
-- ENUMs NUEVOS
-- =============================================================================

CREATE TYPE public.order_status_enum AS ENUM (
  'DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'PARTIAL', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE public.delivery_status_enum AS ENUM (
  'PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED'
);

CREATE TYPE public.invoice_status_enum AS ENUM (
  'DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED', 'VOIDED'
);

CREATE TYPE public.payment_method_enum AS ENUM (
  'CASH', 'BANK_TRANSFER', 'CREDIT', 'CHECK', 'ONLINE'
);

CREATE TYPE public.currency_enum AS ENUM (
  'PEN', 'USD'
);

CREATE TYPE public.customer_type_enum AS ENUM (
  'RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'GOVERNMENT', 'OTHER'
);

CREATE TYPE public.audit_action_enum AS ENUM (
  'INSERT', 'UPDATE', 'DELETE'
);

-- =============================================================================
-- MÓDULO: CLIENTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  ruc           TEXT UNIQUE,
  contact_name  TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  city          TEXT,
  country       TEXT NOT NULL DEFAULT 'Perú',
  customer_type public.customer_type_enum NOT NULL DEFAULT 'RETAIL',
  credit_days   INTEGER NOT NULL DEFAULT 0,
  credit_limit  NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_customers_ruc    ON public.customers(ruc);
CREATE INDEX idx_customers_active ON public.customers(is_active);
CREATE INDEX idx_customers_type   ON public.customers(customer_type);

-- =============================================================================
-- MÓDULO: COMPRAS
-- =============================================================================

-- Requisiciones de Compra
CREATE TABLE IF NOT EXISTS public.purchase_requisitions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  status       TEXT NOT NULL DEFAULT 'DRAFT'
                 CHECK (status IN ('DRAFT','APPROVED','REJECTED','FULFILLED','CANCELLED')),
  priority     TEXT NOT NULL DEFAULT 'NORMAL'
                 CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  needed_by    DATE,
  notes        TEXT,
  approved_by  UUID REFERENCES public.profiles(id),
  approved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER purchase_requisitions_updated_at
  BEFORE UPDATE ON public.purchase_requisitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_purchase_req_status ON public.purchase_requisitions(status);
CREATE INDEX idx_purchase_req_by     ON public.purchase_requisitions(requested_by);

-- Ítems de Requisición
CREATE TABLE IF NOT EXISTS public.purchase_requisition_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id     UUID NOT NULL REFERENCES public.purchase_requisitions(id) ON DELETE CASCADE,
  product_id         UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_requested NUMERIC(12, 3) NOT NULL CHECK (quantity_requested > 0),
  quantity_approved  NUMERIC(12, 3),
  unit_price_ref     NUMERIC(12, 2),
  notes              TEXT,
  sort_order         INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_preq_items_req     ON public.purchase_requisition_items(requisition_id);
CREATE INDEX idx_preq_items_product ON public.purchase_requisition_items(product_id);

-- Órdenes de Compra
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  requisition_id  UUID REFERENCES public.purchase_requisitions(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT','SENT','PARTIAL','RECEIVED','CANCELLED')),
  expected_date   DATE,
  subtotal        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency        public.currency_enum NOT NULL DEFAULT 'PEN',
  exchange_rate   NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  notes           TEXT,
  approved_by     UUID REFERENCES public.profiles(id),
  approved_at     TIMESTAMPTZ,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_po_supplier  ON public.purchase_orders(supplier_id);
CREATE INDEX idx_po_status    ON public.purchase_orders(status);
CREATE INDEX idx_po_created   ON public.purchase_orders(created_at DESC);

-- Detalles de Orden de Compra
CREATE TABLE IF NOT EXISTS public.purchase_order_details (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id  UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id         UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_ordered   NUMERIC(12, 3) NOT NULL CHECK (quantity_ordered > 0),
  quantity_received  NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit_price         NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
  discount_pct       NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 100),
  subtotal           NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order         INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_pod_order   ON public.purchase_order_details(purchase_order_id);
CREATE INDEX idx_pod_product ON public.purchase_order_details(product_id);

-- Recepciones de Mercadería (Goods Receipts)
CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE RESTRICT,
  warehouse_id      UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  receipt_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  status            TEXT NOT NULL DEFAULT 'COMPLETE'
                      CHECK (status IN ('PENDING','PARTIAL','COMPLETE','REJECTED')),
  notes             TEXT,
  received_by       UUID REFERENCES public.profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER goods_receipts_updated_at
  BEFORE UPDATE ON public.goods_receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_gr_purchase_order ON public.goods_receipts(purchase_order_id);
CREATE INDEX idx_gr_warehouse      ON public.goods_receipts(warehouse_id);
CREATE INDEX idx_gr_date           ON public.goods_receipts(receipt_date DESC);

-- Ítems de Recepción (vinculados al Kardex)
CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id        UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  purchase_order_detail_id UUID REFERENCES public.purchase_order_details(id) ON DELETE SET NULL,
  product_id              UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id                UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  quantity_received       NUMERIC(12, 3) NOT NULL CHECK (quantity_received > 0),
  unit_cost               NUMERIC(12, 4) NOT NULL DEFAULT 0,
  -- FK al movimiento generado en inventory_movements
  movement_id             UUID,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gri_receipt  ON public.goods_receipt_items(goods_receipt_id);
CREATE INDEX idx_gri_product  ON public.goods_receipt_items(product_id);
CREATE INDEX idx_gri_batch    ON public.goods_receipt_items(batch_id);

-- =============================================================================
-- MÓDULO: VENTAS
-- =============================================================================

-- Cotizaciones
CREATE TABLE IF NOT EXISTS public.quotations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  status      TEXT NOT NULL DEFAULT 'DRAFT'
                CHECK (status IN ('DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED')),
  valid_until DATE,
  subtotal    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate    NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount  NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total       NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency    public.currency_enum NOT NULL DEFAULT 'PEN',
  notes       TEXT,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX idx_quotations_status   ON public.quotations(status);

-- Ítems de Cotización
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity     NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
  discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  subtotal     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_qi_quotation ON public.quotation_items(quotation_id);
CREATE INDEX idx_qi_product   ON public.quotation_items(product_id);

-- Órdenes de Venta
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  customer_id   UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  quotation_id  UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'CONFIRMED'
                  CHECK (status IN ('CONFIRMED','PROCESSING','PARTIAL','DELIVERED','CANCELLED')),
  delivery_date DATE,
  warehouse_id  UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  subtotal      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate      NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total         NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency      public.currency_enum NOT NULL DEFAULT 'PEN',
  notes         TEXT,
  created_by    UUID REFERENCES public.profiles(id),
  approved_by   UUID REFERENCES public.profiles(id),
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER sales_orders_updated_at
  BEFORE UPDATE ON public.sales_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_so_customer  ON public.sales_orders(customer_id);
CREATE INDEX idx_so_status    ON public.sales_orders(status);
CREATE INDEX idx_so_created   ON public.sales_orders(created_at DESC);

-- Detalles de Orden de Venta
CREATE TABLE IF NOT EXISTS public.sales_order_details (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id      UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_ordered    NUMERIC(12, 3) NOT NULL CHECK (quantity_ordered > 0),
  quantity_delivered  NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit_price          NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
  discount_pct        NUMERIC(5, 2) NOT NULL DEFAULT 0,
  subtotal            NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order          INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_sod_order   ON public.sales_order_details(sales_order_id);
CREATE INDEX idx_sod_product ON public.sales_order_details(product_id);

-- Entregas
CREATE TABLE IF NOT EXISTS public.deliveries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT NOT NULL UNIQUE,
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE RESTRICT,
  warehouse_id   UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  delivery_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  status         public.delivery_status_enum NOT NULL DEFAULT 'DELIVERED',
  notes          TEXT,
  delivered_by   UUID REFERENCES public.profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_deliveries_order     ON public.deliveries(sales_order_id);
CREATE INDEX idx_deliveries_warehouse ON public.deliveries(warehouse_id);
CREATE INDEX idx_deliveries_date      ON public.deliveries(delivery_date DESC);

-- Ítems de Entrega (vinculados al Kardex)
CREATE TABLE IF NOT EXISTS public.delivery_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id           UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  sales_order_detail_id UUID REFERENCES public.sales_order_details(id) ON DELETE SET NULL,
  product_id            UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id              UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  quantity_delivered    NUMERIC(12, 3) NOT NULL CHECK (quantity_delivered > 0),
  unit_price            NUMERIC(12, 4) NOT NULL DEFAULT 0,
  -- FK al movimiento generado en inventory_movements
  movement_id           UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_di_delivery ON public.delivery_items(delivery_id);
CREATE INDEX idx_di_product  ON public.delivery_items(product_id);
CREATE INDEX idx_di_batch    ON public.delivery_items(batch_id);

-- =============================================================================
-- MÓDULO: MANUFACTURA
-- =============================================================================

-- Lista de Materiales (BOM)
CREATE TABLE IF NOT EXISTS public.bill_of_materials (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  name             TEXT NOT NULL,
  version          TEXT NOT NULL DEFAULT '1.0',
  output_quantity  NUMERIC(12, 3) NOT NULL DEFAULT 1 CHECK (output_quantity > 0),
  unit_measure_id  UUID REFERENCES public.unit_measures(id) ON DELETE RESTRICT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  notes            TEXT,
  created_by       UUID REFERENCES public.profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, version)
);

CREATE TRIGGER bom_updated_at
  BEFORE UPDATE ON public.bill_of_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_bom_product ON public.bill_of_materials(product_id);
CREATE INDEX idx_bom_active  ON public.bill_of_materials(is_active);

-- Componentes del BOM
CREATE TABLE IF NOT EXISTS public.bill_of_material_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id          UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity        NUMERIC(12, 5) NOT NULL CHECK (quantity > 0),
  unit_measure_id UUID REFERENCES public.unit_measures(id) ON DELETE RESTRICT,
  is_optional     BOOLEAN NOT NULL DEFAULT FALSE,
  scrap_pct       NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (scrap_pct BETWEEN 0 AND 100),
  notes           TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  UNIQUE(bom_id, product_id)
);

CREATE INDEX idx_bom_items_bom     ON public.bill_of_material_items(bom_id);
CREATE INDEX idx_bom_items_product ON public.bill_of_material_items(product_id);

-- Órdenes de Producción
CREATE TABLE IF NOT EXISTS public.production_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,
  bom_id           UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE RESTRICT,
  warehouse_id     UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  status           TEXT NOT NULL DEFAULT 'DRAFT'
                     CHECK (status IN ('DRAFT','IN_PROGRESS','COMPLETED','CANCELLED')),
  quantity_planned NUMERIC(12, 3) NOT NULL CHECK (quantity_planned > 0),
  quantity_produced NUMERIC(12, 3) NOT NULL DEFAULT 0,
  planned_start    DATE,
  planned_end      DATE,
  actual_start     TIMESTAMPTZ,
  actual_end       TIMESTAMPTZ,
  notes            TEXT,
  created_by       UUID REFERENCES public.profiles(id),
  approved_by      UUID REFERENCES public.profiles(id),
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER production_orders_updated_at
  BEFORE UPDATE ON public.production_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_prod_orders_bom    ON public.production_orders(bom_id);
CREATE INDEX idx_prod_orders_status ON public.production_orders(status);
CREATE INDEX idx_prod_orders_wh     ON public.production_orders(warehouse_id);

-- Consumos de Producción (EXIT del Kardex)
CREATE TABLE IF NOT EXISTS public.production_order_consumptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id            UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  quantity_planned    NUMERIC(12, 3) NOT NULL,
  quantity_consumed   NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit_cost           NUMERIC(12, 4),
  -- FK al movimiento EXIT en inventory_movements
  movement_id         UUID,
  consumed_at         TIMESTAMPTZ,
  consumed_by         UUID REFERENCES public.profiles(id)
);

CREATE INDEX idx_poc_order   ON public.production_order_consumptions(production_order_id);
CREATE INDEX idx_poc_product ON public.production_order_consumptions(product_id);

-- Outputs de Producción (ENTRY del Kardex)
CREATE TABLE IF NOT EXISTS public.production_order_outputs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  batch_id            UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  quantity_produced   NUMERIC(12, 3) NOT NULL CHECK (quantity_produced > 0),
  unit_cost           NUMERIC(12, 4),
  -- FK al movimiento ENTRY en inventory_movements
  movement_id         UUID,
  produced_at         TIMESTAMPTZ,
  produced_by         UUID REFERENCES public.profiles(id)
);

CREATE INDEX idx_poo_order   ON public.production_order_outputs(production_order_id);
CREATE INDEX idx_poo_product ON public.production_order_outputs(product_id);

-- =============================================================================
-- MÓDULO: FACTURACIÓN
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_series  TEXT NOT NULL DEFAULT 'F001',
  invoice_number  TEXT NOT NULL,
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  sales_order_id  UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  status          public.invoice_status_enum NOT NULL DEFAULT 'DRAFT',
  issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  subtotal        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency        public.currency_enum NOT NULL DEFAULT 'PEN',
  exchange_rate   NUMERIC(10, 4) NOT NULL DEFAULT 1.0,
  payment_method  public.payment_method_enum NOT NULL DEFAULT 'CASH',
  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(invoice_series, invoice_number)
);

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status   ON public.invoices(status);
CREATE INDEX idx_invoices_date     ON public.invoices(issue_date DESC);
CREATE INDEX idx_invoices_so       ON public.invoices(sales_order_id);

-- Detalles de Factura
CREATE TABLE IF NOT EXISTS public.invoice_details (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  description  TEXT NOT NULL,
  quantity     NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
  discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  tax_rate     NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  subtotal     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_amount   NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total        NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_inv_details_invoice ON public.invoice_details(invoice_id);

-- =============================================================================
-- MÓDULO: AUDITORÍA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id  TEXT NOT NULL,
  action     public.audit_action_enum NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  module     TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- APPEND-ONLY igual que inventory_movements
CREATE RULE no_update_audit_logs AS ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit_logs AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING;

CREATE INDEX idx_audit_table   ON public.audit_logs(table_name);
CREATE INDEX idx_audit_user    ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action  ON public.audit_logs(action);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_record  ON public.audit_logs(table_name, record_id);

-- =============================================================================
-- FUNCIÓN: trigger genérico de auditoría
-- =============================================================================
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_record_id TEXT;
  v_old_values JSONB;
  v_new_values JSONB;
BEGIN
  -- Intentar obtener el usuario del contexto de sesión
  BEGIN
    v_user_id := current_setting('app.current_user_id', TRUE)::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    v_record_id := NEW.id::TEXT;
    v_new_values := to_jsonb(NEW);
    v_old_values := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    v_record_id := NEW.id::TEXT;
    v_new_values := to_jsonb(NEW);
    v_old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id::TEXT;
    v_old_values := to_jsonb(OLD);
    v_new_values := NULL;
  END IF;

  INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values, user_id, module)
  VALUES (TG_TABLE_NAME, v_record_id, TG_OP::public.audit_action_enum, v_old_values, v_new_values, v_user_id, TG_TABLE_NAME);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de auditoría a tablas críticas
CREATE OR REPLACE TRIGGER audit_purchase_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE OR REPLACE TRIGGER audit_goods_receipts
  AFTER INSERT OR UPDATE OR DELETE ON public.goods_receipts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE OR REPLACE TRIGGER audit_sales_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.sales_orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE OR REPLACE TRIGGER audit_deliveries
  AFTER INSERT OR UPDATE OR DELETE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE OR REPLACE TRIGGER audit_production_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.production_orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE OR REPLACE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- =============================================================================
-- VISTAS ÚTILES
-- =============================================================================

-- Vista: Órdenes de Compra con totales e info de proveedor
CREATE OR REPLACE VIEW public.v_purchase_orders AS
SELECT
  po.id,
  po.code,
  po.status,
  po.expected_date,
  po.total,
  po.currency,
  po.created_at,
  s.business_name AS supplier_name,
  s.ruc AS supplier_ruc,
  pr.full_name AS created_by_name,
  (SELECT COUNT(*) FROM public.purchase_order_details pod WHERE pod.purchase_order_id = po.id) AS items_count,
  (SELECT COALESCE(SUM(pod.quantity_received), 0) FROM public.purchase_order_details pod WHERE pod.purchase_order_id = po.id) AS total_received
FROM public.purchase_orders po
JOIN public.suppliers s ON s.id = po.supplier_id
LEFT JOIN public.profiles pr ON pr.id = po.created_by;

-- Vista: Órdenes de Venta con info de cliente
CREATE OR REPLACE VIEW public.v_sales_orders AS
SELECT
  so.id,
  so.code,
  so.status,
  so.delivery_date,
  so.total,
  so.currency,
  so.created_at,
  c.business_name AS customer_name,
  c.ruc AS customer_ruc,
  w.name AS warehouse_name,
  pr.full_name AS created_by_name,
  (SELECT COUNT(*) FROM public.sales_order_details sod WHERE sod.sales_order_id = so.id) AS items_count
FROM public.sales_orders so
JOIN public.customers c ON c.id = so.customer_id
LEFT JOIN public.warehouses w ON w.id = so.warehouse_id
LEFT JOIN public.profiles pr ON pr.id = so.created_by;

-- Vista: Órdenes de Producción con info de BOM y producto
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
LEFT JOIN public.profiles pr ON pr.id = po.created_by;

-- Vista: Facturas con info de cliente
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
  c.business_name AS customer_name,
  c.ruc AS customer_ruc,
  pr.full_name AS created_by_name,
  CASE
    WHEN i.status = 'ISSUED' AND i.due_date < CURRENT_DATE THEN TRUE
    ELSE FALSE
  END AS is_overdue
FROM public.invoices i
JOIN public.customers c ON c.id = i.customer_id
LEFT JOIN public.profiles pr ON pr.id = i.created_by;

-- =============================================================================
-- FUNCIÓN: Generar código secuencial por módulo
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sequence_counters (
  module TEXT PRIMARY KEY,
  prefix TEXT NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  year_prefix BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO public.sequence_counters (module, prefix) VALUES
  ('purchase_requisitions', 'REQ'),
  ('purchase_orders',       'OC'),
  ('goods_receipts',        'GR'),
  ('quotations',            'COT'),
  ('sales_orders',          'OS'),
  ('deliveries',            'ENT'),
  ('production_orders',     'OP')
ON CONFLICT (module) DO NOTHING;

CREATE OR REPLACE FUNCTION public.next_document_code(p_module TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_next INTEGER;
  v_code TEXT;
BEGIN
  SELECT prefix, year_prefix
  INTO v_prefix, v_next
  FROM public.sequence_counters
  WHERE module = p_module
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Módulo no registrado en sequence_counters: %', p_module;
  END IF;

  v_year := TO_CHAR(NOW(), 'YYYY');

  UPDATE public.sequence_counters
  SET current_value = current_value + 1
  WHERE module = p_module
  RETURNING current_value INTO v_next;

  v_code := v_prefix || '-' || v_year || '-' || LPAD(v_next::TEXT, 5, '0');
  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- INVENTARIO ADITIVOS DRAFV — Row Level Security (RLS) para Supabase
-- =============================================================================

-- =============================================================================
-- FUNCIÓN HELPER: verificar si el usuario tiene un rol específico
-- =============================================================================
CREATE OR REPLACE FUNCTION public.user_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = role_name
      AND r.is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- FUNCIÓN HELPER: verificar si el usuario tiene un permiso específico
-- =============================================================================
CREATE OR REPLACE FUNCTION public.user_has_permission(p_module TEXT, p_action TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE ur.user_id = auth.uid()
      AND perm.module = p_module
      AND perm.action = p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- FUNCIÓN HELPER: verificar si es administrador
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.user_has_role('Administrador');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- HABILITAR RLS en todas las tablas
-- =============================================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_measures     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers         ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS: profiles
-- =============================================================================
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: roles (solo admin puede gestionar)
-- =============================================================================
CREATE POLICY "roles_select_authenticated" ON public.roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "roles_admin_all" ON public.roles
  FOR ALL USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: permissions
-- =============================================================================
CREATE POLICY "permissions_select_authenticated" ON public.permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "permissions_admin_all" ON public.permissions
  FOR ALL USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: user_roles
-- =============================================================================
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: role_permissions
-- =============================================================================
CREATE POLICY "role_permissions_select" ON public.role_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "role_permissions_admin" ON public.role_permissions
  FOR ALL USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: categories
-- =============================================================================
CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "categories_insert" ON public.categories
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "categories_update" ON public.categories
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "categories_delete" ON public.categories
  FOR DELETE USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: brands
-- =============================================================================
CREATE POLICY "brands_select" ON public.brands
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "brands_insert" ON public.brands
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "brands_update" ON public.brands
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "brands_delete" ON public.brands
  FOR DELETE USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: unit_measures
-- =============================================================================
CREATE POLICY "unit_measures_select" ON public.unit_measures
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "unit_measures_admin" ON public.unit_measures
  FOR ALL USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: products
-- =============================================================================
CREATE POLICY "products_select" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "products_insert" ON public.products
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "products_update" ON public.products
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén') OR
    public.user_has_role('Almacenero')
  );

CREATE POLICY "products_delete" ON public.products
  FOR DELETE USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: warehouses
-- =============================================================================
CREATE POLICY "warehouses_select" ON public.warehouses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "warehouses_insert_update" ON public.warehouses
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "warehouses_update" ON public.warehouses
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "warehouses_delete" ON public.warehouses
  FOR DELETE USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: locations
-- =============================================================================
CREATE POLICY "locations_select" ON public.locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "locations_insert" ON public.locations
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "locations_update" ON public.locations
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "locations_delete" ON public.locations
  FOR DELETE USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: inventory
-- =============================================================================
CREATE POLICY "inventory_select" ON public.inventory
  FOR SELECT USING (auth.role() = 'authenticated');

-- El inventario SOLO se modifica mediante la función register_inventory_movement
-- No se permite update/delete directo desde la app
CREATE POLICY "inventory_system_update" ON public.inventory
  FOR UPDATE USING (auth.role() = 'service_role');

-- =============================================================================
-- POLÍTICAS: batches
-- =============================================================================
CREATE POLICY "batches_select" ON public.batches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "batches_insert" ON public.batches
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén') OR
    public.user_has_role('Almacenero') OR
    public.user_has_role('Compras')
  );

CREATE POLICY "batches_update" ON public.batches
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "batches_delete" ON public.batches
  FOR DELETE USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: inventory_movements (KARDEX — solo INSERT)
-- =============================================================================
CREATE POLICY "movements_select" ON public.inventory_movements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "movements_insert" ON public.inventory_movements
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Jefe de Almacén') OR
    public.user_has_role('Almacenero')
  );

-- NO se permiten UPDATE ni DELETE (garantizado por RULES en schema.sql)

-- =============================================================================
-- POLÍTICAS: suppliers
-- =============================================================================
CREATE POLICY "suppliers_select" ON public.suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "suppliers_insert" ON public.suppliers
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "suppliers_update" ON public.suppliers
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "suppliers_delete" ON public.suppliers
  FOR DELETE USING (public.is_admin());


-- =============================================================================
-- INVENTARIO ADITIVOS DRAFV — RLS Extensión ERP v2.0
-- Ejecutar DESPUÉS de rls.sql (v1.0) y schema_erp_extension.sql
-- =============================================================================

-- =============================================================================
-- HABILITAR RLS en tablas nuevas
-- =============================================================================
ALTER TABLE public.customers                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requisitions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requisition_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_details        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_details           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_of_materials             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_of_material_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_order_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_order_outputs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_details               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_counters             ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICAS: customers
-- =============================================================================
CREATE POLICY "customers_select" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "customers_insert" ON public.customers
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas')
  );

CREATE POLICY "customers_update" ON public.customers
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas')
  );

CREATE POLICY "customers_delete" ON public.customers
  FOR DELETE USING (public.is_admin());

-- =============================================================================
-- POLÍTICAS: purchase_requisitions
-- =============================================================================
CREATE POLICY "purchase_req_select" ON public.purchase_requisitions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "purchase_req_insert" ON public.purchase_requisitions
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén') OR
    public.user_has_role('Almacenero')
  );

CREATE POLICY "purchase_req_update" ON public.purchase_requisitions
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "purchase_req_delete" ON public.purchase_requisitions
  FOR DELETE USING (public.is_admin());

-- Items de requisición siguen la misma política que el padre
CREATE POLICY "purchase_req_items_select" ON public.purchase_requisition_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "purchase_req_items_write" ON public.purchase_requisition_items
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén')
  );

-- =============================================================================
-- POLÍTICAS: purchase_orders
-- =============================================================================
CREATE POLICY "purchase_orders_select" ON public.purchase_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "purchase_orders_insert" ON public.purchase_orders
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "purchase_orders_update" ON public.purchase_orders
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "purchase_orders_delete" ON public.purchase_orders
  FOR DELETE USING (public.is_admin());

CREATE POLICY "purchase_order_details_select" ON public.purchase_order_details
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "purchase_order_details_write" ON public.purchase_order_details
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén')
  );

-- =============================================================================
-- POLÍTICAS: goods_receipts
-- =============================================================================
CREATE POLICY "goods_receipts_select" ON public.goods_receipts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "goods_receipts_insert" ON public.goods_receipts
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén') OR
    public.user_has_role('Almacenero')
  );

CREATE POLICY "goods_receipts_update" ON public.goods_receipts
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "goods_receipts_delete" ON public.goods_receipts
  FOR DELETE USING (public.is_admin());

CREATE POLICY "goods_receipt_items_select" ON public.goods_receipt_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "goods_receipt_items_write" ON public.goods_receipt_items
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Compras') OR
    public.user_has_role('Jefe de Almacén') OR
    public.user_has_role('Almacenero')
  );

-- =============================================================================
-- POLÍTICAS: quotations
-- =============================================================================
CREATE POLICY "quotations_select" ON public.quotations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "quotations_insert" ON public.quotations
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas')
  );

CREATE POLICY "quotations_update" ON public.quotations
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas')
  );

CREATE POLICY "quotations_delete" ON public.quotations
  FOR DELETE USING (public.is_admin());

CREATE POLICY "quotation_items_select" ON public.quotation_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "quotation_items_write" ON public.quotation_items
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas')
  );

-- =============================================================================
-- POLÍTICAS: sales_orders
-- =============================================================================
CREATE POLICY "sales_orders_select" ON public.sales_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "sales_orders_insert" ON public.sales_orders
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas')
  );

CREATE POLICY "sales_orders_update" ON public.sales_orders
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas') OR
    public.user_has_role('Almacenero')
  );

CREATE POLICY "sales_orders_delete" ON public.sales_orders
  FOR DELETE USING (public.is_admin());

CREATE POLICY "sales_order_details_select" ON public.sales_order_details
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "sales_order_details_write" ON public.sales_order_details
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas')
  );

-- =============================================================================
-- POLÍTICAS: deliveries
-- =============================================================================
CREATE POLICY "deliveries_select" ON public.deliveries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "deliveries_insert" ON public.deliveries
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas') OR
    public.user_has_role('Almacenero') OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "deliveries_update" ON public.deliveries
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Jefe de Ventas') OR
    public.user_has_role('Jefe de Almacén')
  );

CREATE POLICY "deliveries_delete" ON public.deliveries
  FOR DELETE USING (public.is_admin());

CREATE POLICY "delivery_items_select" ON public.delivery_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "delivery_items_write" ON public.delivery_items
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Ventas') OR
    public.user_has_role('Jefe de Ventas') OR
    public.user_has_role('Almacenero') OR
    public.user_has_role('Jefe de Almacén')
  );

-- =============================================================================
-- POLÍTICAS: bill_of_materials
-- =============================================================================
CREATE POLICY "bom_select" ON public.bill_of_materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "bom_insert" ON public.bill_of_materials
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Producción') OR
    public.user_has_role('Jefe de Producción')
  );

CREATE POLICY "bom_update" ON public.bill_of_materials
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Producción') OR
    public.user_has_role('Jefe de Producción')
  );

CREATE POLICY "bom_delete" ON public.bill_of_materials
  FOR DELETE USING (public.is_admin());

CREATE POLICY "bom_items_select" ON public.bill_of_material_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "bom_items_write" ON public.bill_of_material_items
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Producción') OR
    public.user_has_role('Jefe de Producción')
  );

-- =============================================================================
-- POLÍTICAS: production_orders
-- =============================================================================
CREATE POLICY "production_orders_select" ON public.production_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "production_orders_insert" ON public.production_orders
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Producción') OR
    public.user_has_role('Jefe de Producción')
  );

CREATE POLICY "production_orders_update" ON public.production_orders
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Producción') OR
    public.user_has_role('Jefe de Producción')
  );

CREATE POLICY "production_orders_delete" ON public.production_orders
  FOR DELETE USING (public.is_admin());

CREATE POLICY "prod_consumptions_select" ON public.production_order_consumptions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "prod_consumptions_write" ON public.production_order_consumptions
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Producción') OR
    public.user_has_role('Jefe de Producción')
  );

CREATE POLICY "prod_outputs_select" ON public.production_order_outputs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "prod_outputs_write" ON public.production_order_outputs
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Producción') OR
    public.user_has_role('Jefe de Producción')
  );

-- =============================================================================
-- POLÍTICAS: invoices
-- =============================================================================
CREATE POLICY "invoices_select" ON public.invoices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "invoices_insert" ON public.invoices
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    public.user_has_role('Facturación') OR
    public.user_has_role('Jefe de Ventas')
  );

CREATE POLICY "invoices_update" ON public.invoices
  FOR UPDATE USING (
    public.is_admin() OR
    public.user_has_role('Facturación') OR
    public.user_has_role('Jefe de Ventas')
  );

CREATE POLICY "invoices_delete" ON public.invoices
  FOR DELETE USING (public.is_admin());

CREATE POLICY "invoice_details_select" ON public.invoice_details
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "invoice_details_write" ON public.invoice_details
  FOR ALL USING (
    public.is_admin() OR
    public.user_has_role('Facturación') OR
    public.user_has_role('Jefe de Ventas')
  );

-- =============================================================================
-- POLÍTICAS: audit_logs (solo lectura para admins)
-- =============================================================================
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Solo el sistema puede insertar (SECURITY DEFINER en el trigger)
CREATE POLICY "audit_logs_insert_system" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- POLÍTICAS: sequence_counters (solo sistema)
-- =============================================================================
CREATE POLICY "seq_counters_select" ON public.sequence_counters
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "seq_counters_update" ON public.sequence_counters
  FOR UPDATE USING (auth.role() = 'service_role');
