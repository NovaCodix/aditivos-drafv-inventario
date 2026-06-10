// Re-export cn from shadcn's utils location (used by all shadcn components)
export { cn } from '@/lib/utils'

/**
 * Formatea un número como moneda en Soles Peruanos (PEN)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea una fecha en formato DD/MM/YYYY
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date + (date.length === 10 ? 'T00:00:00' : '')) : date
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Lima',
  }).format(d)
}

/**
 * Formatea fecha y hora
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  }).format(d)
}

/**
 * Genera un SKU automático basado en prefijo y timestamp
 */
export function generateSKU(prefix: string = 'ADT'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Trunca texto a una longitud máxima
 */
export function truncate(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '…'
}

/**
 * Convierte un string a slug
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Obtiene las iniciales de un nombre
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Calcula el estado del stock
 */
export function getStockStatus(quantity: number, minimumStock: number, maximumStock?: number | null) {
  if (quantity === 0) return 'OUT_OF_STOCK' as const
  if (quantity <= minimumStock) return 'LOW_STOCK' as const
  if (maximumStock && quantity >= maximumStock) return 'OVER_STOCK' as const
  return 'OK' as const
}

/**
 * Label para tipo de movimiento
 */
export function getMovementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ENTRY: 'Entrada',
    EXIT: 'Salida',
    TRANSFER_IN: 'Transferencia Entrada',
    TRANSFER_OUT: 'Transferencia Salida',
    ADJUSTMENT: 'Ajuste',
  }
  return labels[type] || type
}

/**
 * Delay para simulaciones/demos
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
