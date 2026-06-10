import { createClient } from '@/shared/lib/supabase/server'
import type { InventoryMovement, InventorySummary } from '@/shared/types/database.types'

export interface MovementWithRelations extends InventoryMovement {
  product?: { id: string; name: string; sku: string } | null
  warehouse?: { id: string; name: string } | null
  batch?: { id: string; batch_number: string } | null
  created_by_profile?: { id: string; full_name: string } | null
}

export interface MovementFilters {
  product_id?: string
  warehouse_id?: string
  movement_type?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
}

export async function getInventoryMovements(filters: MovementFilters = {}) {
  const supabase = await createClient()
  const { product_id, warehouse_id, movement_type, date_from, date_to, page = 1, pageSize = 50 } = filters

  let query = supabase
    .from('inventory_movements')
    .select(`
      *,
      product:products(id, name, sku),
      warehouse:warehouses(id, name),
      batch:batches(id, batch_number),
      created_by_profile:profiles!created_by(id, full_name)
    `, { count: 'exact' })

  if (product_id) query = query.eq('product_id', product_id)
  if (warehouse_id) query = query.eq('warehouse_id', warehouse_id)
  if (movement_type) query = query.eq('movement_type', movement_type)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to + 'T23:59:59')

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: data as MovementWithRelations[], count: count || 0 }
}

export async function registerMovement(params: {
  product_id: string
  warehouse_id: string
  batch_id?: string | null
  location_id?: string | null
  movement_type: 'ENTRY' | 'EXIT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT'
  quantity: number
  unit_cost?: number | null
  reference_type?: string | null
  reference_id?: string | null
  notes?: string | null
  created_by?: string | null
}): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('register_inventory_movement', {
    p_product_id: params.product_id,
    p_warehouse_id: params.warehouse_id,
    p_batch_id: params.batch_id || null,
    p_location_id: params.location_id || null,
    p_movement_type: params.movement_type,
    p_quantity: params.quantity,
    p_unit_cost: params.unit_cost || null,
    p_reference_type: params.reference_type as 'PURCHASE' | 'SALE' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN' | 'INITIAL' | null,
    p_reference_id: params.reference_id || null,
    p_notes: params.notes || null,
    p_created_by: params.created_by || null,
  } as any)

  if (error) throw new Error(error.message)
  return data as string
}

export async function getInventorySummary(warehouseId?: string): Promise<InventorySummary[]> {
  const supabase = await createClient()
  let query = supabase
    .from('v_inventory_summary')
    .select('*')

  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId)
  }

  const { data, error } = await query.order('product_name')
  if (error) throw new Error(error.message)
  return data || []
}
