import { createClient } from '@/shared/lib/supabase/server'
import type { InventoryMovement, InventorySummary } from '@/shared/types/database.types'

export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalWarehouses: number
  lowStockCount: number
  outOfStockCount: number
  recentMovements: (InventoryMovement & {
    product_name?: string
    warehouse_name?: string
    created_by_name?: string
  })[]
  movementsByDay: { date: string; entries: number; exits: number }[]
  topMovedProducts: { product_name: string; total: number }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const [
    productsResult,
    warehousesResult,
    lowStockResult,
    outOfStockResult,
    movementsResult,
  ] = await Promise.all([
    supabase.from('products').select('id, is_active').eq('is_active', true),
    supabase.from('warehouses').select('id').eq('is_active', true),
    supabase.from('v_low_stock').select('id').eq('stock_status', 'LOW_STOCK'),
    supabase.from('v_low_stock').select('id').eq('stock_status', 'OUT_OF_STOCK'),
    supabase
      .from('inventory_movements')
      .select(`
        id,
        product_id,
        warehouse_id,
        movement_type,
        quantity,
        stock_before,
        stock_after,
        notes,
        created_at,
        created_by
      `)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Movimientos de los últimos 30 días por día
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: chartMovements } = await supabase
    .from('inventory_movements')
    .select('movement_type, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .in('movement_type', ['ENTRY', 'EXIT'])

  // Agrupar por día
  const movementsByDayMap = new Map<string, { entries: number; exits: number }>()
  chartMovements?.forEach(m => {
    const date = m.created_at.substring(0, 10)
    const existing = movementsByDayMap.get(date) || { entries: 0, exits: 0 }
    if (m.movement_type === 'ENTRY') existing.entries++
    else existing.exits++
    movementsByDayMap.set(date, existing)
  })

  const movementsByDay = Array.from(movementsByDayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14) // Últimos 14 días

  return {
    totalProducts: productsResult.data?.length || 0,
    activeProducts: productsResult.data?.length || 0,
    totalWarehouses: warehousesResult.data?.length || 0,
    lowStockCount: lowStockResult.data?.length || 0,
    outOfStockCount: outOfStockResult.data?.length || 0,
    recentMovements: (movementsResult.data || []) as DashboardStats['recentMovements'],
    movementsByDay,
    topMovedProducts: [],
  }
}
