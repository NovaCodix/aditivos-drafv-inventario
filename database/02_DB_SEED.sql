-- ==========================================================================================
-- SISTEMA DE INVENTARIO Y ERP "ADITIVOS DRAFV"
-- SCRIPT 02: DATOS INICIALES (SEED)
-- ==========================================================================================
-- INSTRUCCIONES DE EJECUCIÓN:
-- 1. Ejecutar este script ÚNICAMENTE DESPUÉS de haber ejecutado el Script 01.
-- 2. Este script poblará la base de datos con:
--    - Roles del sistema (Admin, Almacén, Ventas, Compras, Producción, Facturación, etc.)
--    - Permisos granulares por módulo.
--    - Unidades de medida base.
--    - Categorías de aditivos preconfiguradas.
--    - Almacenes y ubicaciones iniciales.
--    - Marcas y Proveedores de ejemplo.
-- ==========================================================================================

-- =============================================================================
-- INVENTARIO ADITIVOS DRAFV — Seed SQL (Datos Iniciales)
-- =============================================================================

-- =============================================================================
-- ROLES
-- =============================================================================
INSERT INTO public.roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Administrador',    'Acceso total al sistema'),
  ('00000000-0000-0000-0000-000000000002', 'Jefe de Almacén',  'Gestión completa de almacenes e inventario'),
  ('00000000-0000-0000-0000-000000000003', 'Almacenero',       'Registro de movimientos y consulta de stock'),
  ('00000000-0000-0000-0000-000000000004', 'Compras',          'Gestión de proveedores y órdenes de compra'),
  ('00000000-0000-0000-0000-000000000005', 'Auditor',          'Acceso de solo lectura a todos los módulos'),
  ('00000000-0000-0000-0000-000000000006', 'Ventas',           'Gestión de cotizaciones, ventas y clientes'),
  ('00000000-0000-0000-0000-000000000007', 'Jefe de Ventas',   'Aprobación de ventas y gestión total del área comercial'),
  ('00000000-0000-0000-0000-000000000008', 'Producción',       'Ejecución de órdenes de producción y BOMs'),
  ('00000000-0000-0000-0000-000000000009', 'Jefe de Producción','Planificación y control total de manufactura'),
  ('00000000-0000-0000-0000-000000000010', 'Facturación',      'Emisión y gestión de facturas y pagos')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PERMISOS (módulo + acción)
-- =============================================================================
INSERT INTO public.permissions (module, action, description) VALUES
  -- Dashboard
  ('dashboard',   'read',   'Ver dashboard'),
  -- Products
  ('products',    'read',   'Ver productos'),
  ('products',    'create', 'Crear productos'),
  ('products',    'update', 'Editar productos'),
  ('products',    'delete', 'Eliminar productos'),
  -- Categories
  ('categories',  'read',   'Ver categorías'),
  ('categories',  'create', 'Crear categorías'),
  ('categories',  'update', 'Editar categorías'),
  ('categories',  'delete', 'Eliminar categorías'),
  -- Brands
  ('brands',      'read',   'Ver marcas'),
  ('brands',      'create', 'Crear marcas'),
  ('brands',      'update', 'Editar marcas'),
  ('brands',      'delete', 'Eliminar marcas'),
  -- Warehouses
  ('warehouses',  'read',   'Ver almacenes'),
  ('warehouses',  'create', 'Crear almacenes'),
  ('warehouses',  'update', 'Editar almacenes'),
  ('warehouses',  'delete', 'Eliminar almacenes'),
  -- Locations
  ('locations',   'read',   'Ver ubicaciones'),
  ('locations',   'create', 'Crear ubicaciones'),
  ('locations',   'update', 'Editar ubicaciones'),
  ('locations',   'delete', 'Eliminar ubicaciones'),
  -- Inventory
  ('inventory',   'read',   'Ver inventario'),
  ('inventory',   'entry',  'Registrar entrada de inventario'),
  ('inventory',   'exit',   'Registrar salida de inventario'),
  ('inventory',   'adjust', 'Ajustar inventario'),
  -- Batches
  ('batches',     'read',   'Ver lotes'),
  ('batches',     'create', 'Crear lotes'),
  ('batches',     'update', 'Editar lotes'),
  -- Movements
  ('movements',   'read',   'Ver Kardex/Movimientos'),
  -- Suppliers
  ('suppliers',   'read',   'Ver proveedores'),
  ('suppliers',   'create', 'Crear proveedores'),
  ('suppliers',   'update', 'Editar proveedores'),
  ('suppliers',   'delete', 'Eliminar proveedores'),
  -- Users
  ('users',       'read',   'Ver usuarios'),
  ('users',       'create', 'Crear usuarios'),
  ('users',       'update', 'Editar usuarios'),
  ('users',       'delete', 'Eliminar usuarios'),
  -- Roles
  ('roles',       'read',   'Ver roles'),
  ('roles',       'manage', 'Gestionar roles y permisos'),
  -- Reports
  ('reports',     'read',   'Ver reportes'),
  ('reports',     'export', 'Exportar reportes'),
  -- Settings
  ('settings',    'read',   'Ver configuración'),
  ('settings',    'update', 'Editar configuración'),
  -- ERP Modules
  ('customers',   'read',   'Ver clientes'),
  ('customers',   'create', 'Crear clientes'),
  ('customers',   'update', 'Editar clientes'),
  ('customers',   'delete', 'Eliminar clientes'),
  ('purchases',   'read',   'Ver compras'),
  ('purchases',   'create', 'Crear compras'),
  ('purchases',   'update', 'Editar compras'),
  ('purchases',   'delete', 'Eliminar compras'),
  ('sales',       'read',   'Ver ventas'),
  ('sales',       'create', 'Crear ventas'),
  ('sales',       'update', 'Editar ventas'),
  ('sales',       'delete', 'Eliminar ventas'),
  ('manufacturing','read',  'Ver manufactura'),
  ('manufacturing','create','Crear manufactura'),
  ('manufacturing','update','Editar manufactura'),
  ('manufacturing','delete','Eliminar manufactura'),
  ('invoicing',   'read',   'Ver facturación'),
  ('invoicing',   'create', 'Crear facturación'),
  ('invoicing',   'update', 'Editar facturación'),
  ('invoicing',   'delete', 'Eliminar facturación'),
  ('audit',       'read',   'Ver auditoría')
ON CONFLICT (module, action) DO NOTHING;

-- =============================================================================
-- ASIGNACIÓN DE PERMISOS A ROLES
-- (Administrador tiene todos los permisos)
-- =============================================================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id
FROM public.permissions
ON CONFLICT DO NOTHING;

-- Jefe de Almacén
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id
FROM public.permissions
WHERE (module, action) IN (
  ('dashboard',   'read'),
  ('products',    'read'), ('products',   'create'), ('products',   'update'),
  ('categories',  'read'), ('categories', 'create'), ('categories', 'update'),
  ('brands',      'read'), ('brands',     'create'), ('brands',     'update'),
  ('warehouses',  'read'), ('warehouses', 'create'), ('warehouses', 'update'),
  ('locations',   'read'), ('locations',  'create'), ('locations',  'update'),
  ('inventory',   'read'), ('inventory',  'entry'),  ('inventory',  'exit'), ('inventory', 'adjust'),
  ('batches',     'read'), ('batches',    'create'), ('batches',    'update'),
  ('movements',   'read'),
  ('suppliers',   'read'), ('suppliers',  'create'), ('suppliers',  'update'),
  ('users',       'read'),
  ('reports',     'read'), ('reports',    'export')
)
ON CONFLICT DO NOTHING;

-- Almacenero
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id
FROM public.permissions
WHERE (module, action) IN (
  ('dashboard',  'read'),
  ('products',   'read'),
  ('categories', 'read'),
  ('brands',     'read'),
  ('warehouses', 'read'),
  ('locations',  'read'),
  ('inventory',  'read'), ('inventory', 'entry'), ('inventory', 'exit'),
  ('batches',    'read'), ('batches',   'create'),
  ('movements',  'read')
)
ON CONFLICT DO NOTHING;

-- Compras
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id
FROM public.permissions
WHERE (module, action) IN (
  ('dashboard',  'read'),
  ('products',   'read'),
  ('inventory',  'read'),
  ('batches',    'read'), ('batches',   'create'),
  ('movements',  'read'),
  ('suppliers',  'read'), ('suppliers', 'create'), ('suppliers', 'update'), ('suppliers', 'delete'),
  ('reports',    'read')
)
ON CONFLICT DO NOTHING;

-- Auditor (solo lectura)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000005', id
FROM public.permissions
WHERE action = 'read'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- UNIDADES DE MEDIDA
-- =============================================================================
INSERT INTO public.unit_measures (name, abbreviation, description) VALUES
  ('Kilogramo',   'KG',  'Medida de masa en kilogramos'),
  ('Litro',       'LT',  'Medida de volumen en litros'),
  ('Galón',       'GAL', 'Medida de volumen en galones (3.785 L)'),
  ('Unidad',      'UND', 'Unidad discreta'),
  ('Tonelada',    'TON', 'Medida de masa en toneladas métricas'),
  ('Gramo',       'GR',  'Medida de masa en gramos'),
  ('Mililitro',   'ML',  'Medida de volumen en mililitros'),
  ('Saco',        'SCO', 'Saco (generalmente 25KG o 50KG)'),
  ('Bidón',       'BID', 'Bidón (generalmente 200LT)'),
  ('Metro cúbico','M3',  'Medida de volumen en metros cúbicos')
ON CONFLICT (abbreviation) DO NOTHING;

-- =============================================================================
-- CATEGORÍAS DE ADITIVOS PARA CONCRETO
-- =============================================================================
INSERT INTO public.categories (id, name, description, parent_id, slug) VALUES
  -- Categorías principales
  ('10000000-0000-0000-0000-000000000001', 'Aditivos Químicos',       'Productos químicos para concreto y mortero',          NULL, 'aditivos-quimicos'),
  ('10000000-0000-0000-0000-000000000002', 'Materiales Cementantes',  'Cementos, puzolanas y materiales suplementarios',    NULL, 'materiales-cementantes'),
  ('10000000-0000-0000-0000-000000000003', 'Insumos y Herramientas',  'Insumos generales y herramientas de laboratorio',    NULL, 'insumos-herramientas'),
  -- Subcategorías de Aditivos Químicos
  ('10000000-0000-0000-0000-000000000011', 'Acelerantes',    'Aditivos que aceleran el fraguado del concreto',             '10000000-0000-0000-0000-000000000001', 'acelerantes'),
  ('10000000-0000-0000-0000-000000000012', 'Retardantes',    'Aditivos que retardan el fraguado del concreto',             '10000000-0000-0000-0000-000000000001', 'retardantes'),
  ('10000000-0000-0000-0000-000000000013', 'Plastificantes', 'Reductores de agua y mejoradores de trabajabilidad',        '10000000-0000-0000-0000-000000000001', 'plastificantes'),
  ('10000000-0000-0000-0000-000000000014', 'Superplastificantes', 'Reductores de agua de alto rango (HRWR)',               '10000000-0000-0000-0000-000000000001', 'superplastificantes'),
  ('10000000-0000-0000-0000-000000000015', 'Incorporadores de Aire', 'Aditivos incorporadores de aire para durabilidad',   '10000000-0000-0000-0000-000000000001', 'incorporadores-aire'),
  ('10000000-0000-0000-0000-000000000016', 'Impermeabilizantes', 'Aditivos para impermeabilización del concreto',         '10000000-0000-0000-0000-000000000001', 'impermeabilizantes'),
  ('10000000-0000-0000-0000-000000000017', 'Fibras',         'Fibras sintéticas y metálicas para refuerzo',               '10000000-0000-0000-0000-000000000001', 'fibras'),
  ('10000000-0000-0000-0000-000000000018', 'Desmoldantes',   'Agentes desmoldantes para encofrados',                       '10000000-0000-0000-0000-000000000001', 'desmoldantes')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- MARCAS
-- =============================================================================
INSERT INTO public.brands (name, description) VALUES
  ('SIKA',       'Sika AG — Especialistas en química para construcción'),
  ('CHEMA',      'Chema Perú — Soluciones químicas para la construcción'),
  ('BASF',       'BASF Construction Chemicals — Master Builders Solutions'),
  ('GRACE',      'W.R. Grace & Co. — Aditivos para concreto'),
  ('EUCO',       'Euclid Chemical — Productos para concreto'),
  ('INTAC',      'Intac Perú — Aditivos nacionales'),
  ('MAPEI',      'Mapei — Soluciones para construcción'),
  ('FOSROC',     'Fosroc International — Productos de construcción'),
  ('CHRYSO',     'CHRYSO — Aditivos y adiciones minerales'),
  ('SIN MARCA',  'Producto genérico sin marca registrada')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- ALMACENES
-- =============================================================================
INSERT INTO public.warehouses (id, name, description, address) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Almacén Central',
   'Almacén principal de aditivos y materiales',
   'Av. Industrial 1234, Lima, Perú'),
  ('20000000-0000-0000-0000-000000000002', 'Almacén de Cuarentena',
   'Área de cuarentena para productos en revisión o vencidos',
   'Av. Industrial 1234, Lima, Perú — Zona B'),
  ('20000000-0000-0000-0000-000000000003', 'Almacén de Distribución',
   'Almacén de tránsito para despacho y distribución',
   'Calle Comercio 567, Lima, Perú')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- UBICACIONES (Almacén Central)
-- =============================================================================
INSERT INTO public.locations (warehouse_id, code, aisle, rack, level, description) VALUES
  ('20000000-0000-0000-0000-000000000001', 'A-01-01', 'A', '01', '01', 'Pasillo A, Estante 1, Nivel 1'),
  ('20000000-0000-0000-0000-000000000001', 'A-01-02', 'A', '01', '02', 'Pasillo A, Estante 1, Nivel 2'),
  ('20000000-0000-0000-0000-000000000001', 'A-01-03', 'A', '01', '03', 'Pasillo A, Estante 1, Nivel 3'),
  ('20000000-0000-0000-0000-000000000001', 'A-02-01', 'A', '02', '01', 'Pasillo A, Estante 2, Nivel 1'),
  ('20000000-0000-0000-0000-000000000001', 'A-02-02', 'A', '02', '02', 'Pasillo A, Estante 2, Nivel 2'),
  ('20000000-0000-0000-0000-000000000001', 'B-01-01', 'B', '01', '01', 'Pasillo B, Estante 1, Nivel 1'),
  ('20000000-0000-0000-0000-000000000001', 'B-01-02', 'B', '01', '02', 'Pasillo B, Estante 1, Nivel 2'),
  ('20000000-0000-0000-0000-000000000001', 'C-01-01', 'C', '01', '01', 'Pasillo C, Estante 1, Nivel 1 — Líquidos'),
  ('20000000-0000-0000-0000-000000000001', 'C-02-01', 'C', '02', '01', 'Pasillo C, Estante 2, Nivel 1 — Líquidos')
ON CONFLICT (warehouse_id, code) DO NOTHING;

-- =============================================================================
-- PROVEEDORES DE MUESTRA
-- =============================================================================
INSERT INTO public.suppliers (business_name, ruc, contact_name, phone, email, city, country) VALUES
  ('Sika Perú S.A.',           '20258565946', 'María García',    '+51 1 618-6200', 'ventas.peru@sika.com',   'Lima',    'Perú'),
  ('Chema S.A.',               '20100907397', 'Carlos López',    '+51 1 618-5000', 'ventas@chema.com.pe',    'Lima',    'Perú'),
  ('BASF Construction Chemicals', '20513049979', 'Ana Torres',   '+51 1 213-1600', 'ccpe@basf.com',          'Lima',    'Perú'),
  ('Euclid Chemical Perú',     '20601234567', 'Roberto Silva',   '+51 1 612-3456', 'info@euclidperu.com',    'Lima',    'Perú'),
  ('Distribuidora Cemix',      '20456789012', 'Pedro Quispe',    '+51 84 225-300', 'ventas@cemix.pe',        'Cusco',   'Perú')
ON CONFLICT (ruc) DO NOTHING;
\n\n
-- Ventas
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000006', id
FROM public.permissions
WHERE (module, action) IN (
  ('dashboard',  'read'),
  ('products',   'read'),
  ('customers',  'read'), ('customers', 'create'), ('customers', 'update'),
  ('sales',      'read'), ('sales',     'create'), ('sales',     'update')
)
ON CONFLICT DO NOTHING;

-- Jefe de Ventas
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000007', id
FROM public.permissions
WHERE (module, action) IN (
  ('dashboard',  'read'),
  ('products',   'read'),
  ('customers',  'read'), ('customers', 'create'), ('customers', 'update'), ('customers', 'delete'),
  ('sales',      'read'), ('sales',     'create'), ('sales',     'update'), ('sales',     'delete'),
  ('invoicing',  'read'), ('invoicing', 'create'), ('invoicing', 'update')
)
ON CONFLICT DO NOTHING;

-- Producción
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000008', id
FROM public.permissions
WHERE (module, action) IN (
  ('dashboard',     'read'),
  ('products',      'read'),
  ('inventory',     'read'),
  ('manufacturing', 'read'), ('manufacturing', 'create'), ('manufacturing', 'update')
)
ON CONFLICT DO NOTHING;

-- Jefe de Producción
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000009', id
FROM public.permissions
WHERE (module, action) IN (
  ('dashboard',     'read'),
  ('products',      'read'),
  ('inventory',     'read'),
  ('manufacturing', 'read'), ('manufacturing', 'create'), ('manufacturing', 'update'), ('manufacturing', 'delete'),
  ('reports',       'read')
)
ON CONFLICT DO NOTHING;

-- Facturación
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000010', id
FROM public.permissions
WHERE (module, action) IN (
  ('dashboard',  'read'),
  ('customers',  'read'),
  ('sales',      'read'),
  ('invoicing',  'read'), ('invoicing', 'create'), ('invoicing', 'update')
)
ON CONFLICT DO NOTHING;
