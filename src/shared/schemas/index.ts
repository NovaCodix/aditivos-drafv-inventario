import { z } from 'zod'

// =============================================================================
// Schemas de validación Zod para cada módulo
// =============================================================================

// --- Productos ---
export const productSchema = z.object({
  sku: z.string().min(1, 'El SKU es requerido').max(50, 'Máximo 50 caracteres'),
  barcode: z.string().max(100).optional().nullable(),
  name: z.string().min(2, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().max(1000).optional().nullable(),
  category_id: z.string().uuid('Categoría inválida').optional().nullable(),
  brand_id: z.string().uuid('Marca inválida').optional().nullable(),
  unit_measure_id: z.string().uuid('Unidad de medida requerida'),
  purchase_price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  sale_price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  image_url: z.string().url().optional().nullable(),
  is_active: z.boolean().default(true),
  notes: z.string().max(1000).optional().nullable(),
})

export type ProductFormValues = z.infer<typeof productSchema>

// --- Categorías ---
export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  slug: z.string().max(100).optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

// --- Marcas ---
export const brandSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  is_active: z.boolean().default(true),
})

export type BrandFormValues = z.infer<typeof brandSchema>

// --- Unidades de Medida ---
export const unitMeasureSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(100),
  abbreviation: z.string().min(1).max(10, 'Máximo 10 caracteres'),
  description: z.string().max(255).optional().nullable(),
  is_active: z.boolean().default(true),
})

export type UnitMeasureFormValues = z.infer<typeof unitMeasureSchema>

// --- Almacenes ---
export const warehouseSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(150),
  description: z.string().max(500).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  manager_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
})

export type WarehouseFormValues = z.infer<typeof warehouseSchema>

// --- Ubicaciones ---
export const locationSchema = z.object({
  warehouse_id: z.string().uuid('El almacén es requerido'),
  code: z.string().min(1, 'El código es requerido').max(50),
  aisle: z.string().max(20).optional().nullable(),
  rack: z.string().max(20).optional().nullable(),
  level: z.string().max(20).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  is_active: z.boolean().default(true),
})

export type LocationFormValues = z.infer<typeof locationSchema>

// --- Lotes ---
export const batchSchema = z.object({
  product_id: z.string().uuid('El producto es requerido'),
  batch_number: z.string().min(1, 'El número de lote es requerido').max(100),
  manufacture_date: z.string().optional().nullable(),
  expiration_date: z.string().optional().nullable(),
  quantity: z.coerce.number().min(0, 'La cantidad no puede ser negativa'),
  notes: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().default(true),
})

export type BatchFormValues = z.infer<typeof batchSchema>

// --- Proveedores ---
export const supplierSchema = z.object({
  business_name: z.string().min(2, 'La razón social es requerida').max(255),
  ruc: z.string()
    .regex(/^\d{11}$/, 'El RUC debe tener 11 dígitos')
    .optional()
    .nullable(),
  contact_name: z.string().max(150).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).default('Perú'),
  website: z.string().url('URL inválida').optional().nullable(),
  credit_days: z.coerce.number().int().min(0).max(365).default(0),
  notes: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().default(true),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

// --- Movimiento de Inventario ---
export const inventoryMovementSchema = z.object({
  product_id: z.string().uuid('El producto es requerido'),
  warehouse_id: z.string().uuid('El almacén es requerido'),
  batch_id: z.string().uuid().optional().nullable(),
  location_id: z.string().uuid().optional().nullable(),
  movement_type: z.enum(['ENTRY', 'EXIT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT']),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
  unit_cost: z.coerce.number().min(0).optional().nullable(),
  reference_type: z.enum(['PURCHASE', 'SALE', 'TRANSFER', 'ADJUSTMENT', 'RETURN', 'INITIAL']).optional().nullable(),
  reference_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export type InventoryMovementFormValues = z.infer<typeof inventoryMovementSchema>

// --- Configuración de Stock ---
export const stockConfigSchema = z.object({
  product_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  minimum_stock: z.coerce.number().min(0, 'El stock mínimo no puede ser negativo'),
  maximum_stock: z.coerce.number().min(0).optional().nullable(),
  location_id: z.string().uuid().optional().nullable(),
})

export type StockConfigFormValues = z.infer<typeof stockConfigSchema>

// --- Roles ---
export const roleSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional().nullable(),
  is_active: z.boolean().default(true),
})

export type RoleFormValues = z.infer<typeof roleSchema>

// --- Login ---
export const loginSchema = z.object({
  email: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
