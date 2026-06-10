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
