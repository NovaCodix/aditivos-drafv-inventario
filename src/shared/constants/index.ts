// =============================================================================
// constants/index.ts — Constantes globales del sistema
// =============================================================================

export const APP_NAME = 'Inventario Aditivos DRAFV'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Sistema de inventario empresarial para aditivos de concreto'

// =============================================================================
// ROLES DEL SISTEMA
// =============================================================================
export const ROLES = {
  ADMIN: 'Administrador',
  WAREHOUSE_MANAGER: 'Jefe de Almacén',
  WAREHOUSE_WORKER: 'Almacenero',
  PURCHASING: 'Compras',
  AUDITOR: 'Auditor',
} as const

export type RoleName = typeof ROLES[keyof typeof ROLES]

// =============================================================================
// TIPOS DE MOVIMIENTO
// =============================================================================
export const MOVEMENT_TYPES = {
  ENTRY: { value: 'ENTRY', label: 'Entrada', color: 'green', icon: 'arrow-down' },
  EXIT: { value: 'EXIT', label: 'Salida', color: 'red', icon: 'arrow-up' },
  TRANSFER_IN: { value: 'TRANSFER_IN', label: 'Transferencia Entrada', color: 'blue', icon: 'arrow-right' },
  TRANSFER_OUT: { value: 'TRANSFER_OUT', label: 'Transferencia Salida', color: 'orange', icon: 'arrow-left' },
  ADJUSTMENT: { value: 'ADJUSTMENT', label: 'Ajuste', color: 'yellow', icon: 'settings' },
} as const

// =============================================================================
// TIPOS DE REFERENCIA
// =============================================================================
export const REFERENCE_TYPES = {
  PURCHASE: { value: 'PURCHASE', label: 'Compra' },
  SALE: { value: 'SALE', label: 'Venta' },
  TRANSFER: { value: 'TRANSFER', label: 'Transferencia' },
  ADJUSTMENT: { value: 'ADJUSTMENT', label: 'Ajuste' },
  RETURN: { value: 'RETURN', label: 'Devolución' },
  INITIAL: { value: 'INITIAL', label: 'Stock Inicial' },
} as const

// =============================================================================
// ESTADO DE STOCK
// =============================================================================
export const STOCK_STATUS = {
  OK: { value: 'OK', label: 'Normal', color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
  LOW_STOCK: { value: 'LOW_STOCK', label: 'Stock Bajo', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  OUT_OF_STOCK: { value: 'OUT_OF_STOCK', label: 'Agotado', color: 'red', bg: 'bg-red-100', text: 'text-red-800' },
  OVER_STOCK: { value: 'OVER_STOCK', label: 'Sobre Stock', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
} as const

// =============================================================================
// PAGINACIÓN
// =============================================================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

// =============================================================================
// MÓDULOS DEL SISTEMA (para sidebar y permisos)
// =============================================================================
export const MODULES = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  WAREHOUSES: 'warehouses',
  LOCATIONS: 'locations',
  INVENTORY: 'inventory',
  BATCHES: 'batches',
  MOVEMENTS: 'movements',
  SUPPLIERS: 'suppliers',
  USERS: 'users',
  ROLES: 'roles',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const

// =============================================================================
// RUTAS DE NAVEGACIÓN
// =============================================================================
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  UNIT_MEASURES: '/unit-measures',
  WAREHOUSES: '/warehouses',
  LOCATIONS: '/locations',
  INVENTORY: '/inventory',
  BATCHES: '/batches',
  MOVEMENTS: '/movements',
  SUPPLIERS: '/suppliers',
  USERS: '/users',
  ROLES: '/roles',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const

// =============================================================================
// CONFIGURACIÓN REGIONAL
// =============================================================================
export const LOCALE_CONFIG = {
  currency: 'PEN',
  currencySymbol: 'S/',
  locale: 'es-PE',
  timezone: 'America/Lima',
  dateFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
} as const
