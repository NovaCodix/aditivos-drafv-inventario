import { createClient } from '@/shared/lib/supabase/server'
import type {
  BillOfMaterials, BillOfMaterialItem,
  ProductionOrder, ProductionOrderView,
  InsertDto,
} from '@/shared/types/database.types'
import { registerMovement } from '@/modules/stock-movements/services/movements.service'

export async function getBillsOfMaterials(filters: { product_id?: string; is_active?: boolean; page?: number; pageSize?: number } = {}) {
  const supabase = await createClient()
  const { product_id, is_active, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('bill_of_materials')
    .select(`*, product:products(id, name, sku), unit_measure:unit_measures(abbreviation)`, { count: 'exact' })

  if (product_id) query = query.eq('product_id', product_id)
  if (is_active !== undefined) query = query.eq('is_active', is_active)

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: (data || []) as Array<BillOfMaterials & { product: any; unit_measure: any }>, count: count || 0 }
}

export async function getBomById(id: string) {
  const supabase = await createClient()
  const [bomResult, itemsResult] = await Promise.all([
    supabase
      .from('bill_of_materials')
      .select(`*, product:products(id, name, sku), unit_measure:unit_measures(id, name, abbreviation)`)
      .eq('id', id)
      .single(),
    supabase
      .from('bill_of_material_items')
      .select(`*, product:products(id, name, sku), unit_measure:unit_measures(id, name, abbreviation)`)
      .eq('bom_id', id)
      .order('sort_order'),
  ])

  if (bomResult.error) return null
  return {
    bom: bomResult.data as BillOfMaterials & { product: any; unit_measure: any },
    items: (itemsResult.data || []) as Array<BillOfMaterialItem & { product: any; unit_measure: any }>,
  }
}

export async function createBom(
  dto: InsertDto<'bill_of_materials'>,
  items: InsertDto<'bill_of_material_items'>[]
) {
  const supabase = await createClient()
  const { data: bom, error } = await supabase
    .from('bill_of_materials')
    .insert(dto as any)
    .select()
    .single()
  if (error) throw new Error(error.message)

  if (items.length > 0) {
    const rows = items.map((item, i) => ({ ...item, bom_id: bom.id, sort_order: i }))
    const { error: itemsError } = await supabase.from('bill_of_material_items').insert(rows as any)
    if (itemsError) throw new Error(itemsError.message)
  }

  return bom as BillOfMaterials
}

export async function getProductionOrders(filters: { status?: string; page?: number; pageSize?: number } = {}) {
  const supabase = await createClient()
  const { status, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('v_production_orders')
    .select('*', { count: 'exact' })

  if (status) query = query.eq('status', status)

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return { data: (data || []) as ProductionOrderView[], count: count || 0 }
}

export async function getProductionOrderById(id: string) {
  const supabase = await createClient()
  const [orderResult, consumptionsResult] = await Promise.all([
    supabase
      .from('production_orders')
      .select(`*, product:products(id, name, sku), bom:bill_of_materials(id, name, version), warehouse:warehouses(id, name)`)
      .eq('id', id)
      .single(),
    supabase
      .from('production_order_consumptions')
      .select(`*, product:products(id, name, sku)`)
      .eq('production_order_id', id)
  ])

  if (orderResult.error) return null

  return {
    order: orderResult.data as ProductionOrder & { product: any; bom: any; warehouse: any },
    consumptions: (consumptionsResult.data || []) as any[]
  }
}

export async function createProductionOrder(dto: InsertDto<'production_orders'>) {
  const supabase = await createClient()
  const { data: code } = await supabase.rpc('next_document_code', { p_module: 'production_orders' })

  const bomResult = await getBomById(dto.bom_id)
  if (!bomResult) throw new Error('BOM no encontrado')

  const { data: order, error } = await supabase
    .from('production_orders')
    .insert({ ...dto, code } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)

  const consumptions = bomResult.items.map(item => ({
    production_order_id: order.id,
    product_id: item.product_id,
    quantity_planned: item.quantity * dto.quantity_planned * (1 + item.scrap_pct / 100),
    quantity_consumed: 0,
  }))

  if (consumptions.length > 0) {
    const { error: consError } = await supabase.from('production_order_consumptions').insert(consumptions as any)
    if (consError) throw new Error(consError.message)
  }

  return order as ProductionOrder
}

export async function startProductionOrder(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('production_orders')
    .update({ status: 'IN_PROGRESS', actual_start: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)

  return data as ProductionOrder
}

export async function completeProductionOrder(
  id: string,
  params: {
    warehouse_id: string
    consumptions: Array<{ consumption_id: string; product_id: string; batch_id?: string | null; quantity_consumed: number; unit_cost?: number }>
    outputs: Array<{ product_id: string; batch_id?: string | null; quantity_produced: number; unit_cost?: number }>
    created_by?: string
  }
) {
  const supabase = await createClient()

  for (const c of params.consumptions) {
    const movementId = await registerMovement({
      product_id: c.product_id,
      warehouse_id: params.warehouse_id,
      batch_id: c.batch_id,
      movement_type: 'EXIT',
      quantity: c.quantity_consumed,
      unit_cost: c.unit_cost || 0,
      reference_type: 'PRODUCTION',
      reference_id: id,
      notes: `Consumo producción`,
      created_by: params.created_by,
    })

    await supabase
      .from('production_order_consumptions')
      .update({
        quantity_consumed: c.quantity_consumed,
        unit_cost: c.unit_cost || null,
        movement_id: movementId,
        consumed_at: new Date().toISOString(),
        consumed_by: params.created_by || null,
      } as any)
      .eq('id', c.consumption_id)
  }

  const outputRows = []
  for (const o of params.outputs) {
    const movementId = await registerMovement({
      product_id: o.product_id,
      warehouse_id: params.warehouse_id,
      batch_id: o.batch_id,
      movement_type: 'ENTRY',
      quantity: o.quantity_produced,
      unit_cost: o.unit_cost,
      reference_type: 'PRODUCTION',
      reference_id: id,
      notes: `Output producción`,
      created_by: params.created_by,
    })

    outputRows.push({
      production_order_id: id,
      product_id: o.product_id,
      batch_id: o.batch_id || null,
      quantity_produced: o.quantity_produced,
      unit_cost: o.unit_cost || null,
      movement_id: movementId,
      produced_at: new Date().toISOString(),
      produced_by: params.created_by || null,
    })
  }

  const { error: outputError } = await supabase.from('production_order_outputs').insert(outputRows as any)
  if (outputError) throw new Error(outputError.message)

  const totalProduced = params.outputs.reduce((sum, o) => sum + o.quantity_produced, 0)

  const { data, error } = await supabase
    .from('production_orders')
    .update({
      status: 'COMPLETED',
      quantity_produced: totalProduced,
      actual_end: new Date().toISOString(),
    } as any)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)

  return data as ProductionOrder
}
