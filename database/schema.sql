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
