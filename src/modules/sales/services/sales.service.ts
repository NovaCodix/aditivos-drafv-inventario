import { createClient } from '@/shared/lib/supabase/server'
import type {
  SalesOrder, SalesOrderView, SalesOrderDetail,
  Delivery, Quotation,
  InsertDto, UpdateDto,
} from '@/shared/types/database.types'
import { registerMovement } from '@/modules/stock-movements/services/movements.service'

export interface SalesOrderFilters {
  search?: string
  customer_id?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
}

// ─── Quotations ───────────────────────────────────────────────────────────────

export async function getQuotations(filters: { customer_id?: string; status?: string; page?: number; pageSize?: number } = {}) {
  const supabase = await createClient()
  const { customer_id, status, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('quotations')
    .select(`*, customer:customers(id, business_name, ruc)`, { count: 'exact' })

  if (customer_id) query = query.eq('customer_id', customer_id)
  if (status) query = query.eq('status', status)

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: (data || []) as Array<Quotation & { customer: any }>, count: count || 0 }
}

export async function createQuotation(
  dto: InsertDto<'quotations'>,
  items: InsertDto<'quotation_items'>[]
) {
  const supabase = await createClient()
  const { data: code } = await supabase.rpc('next_document_code', { p_module: 'quotations' })

  const { data: quotation, error } = await supabase
    .from('quotations')
    .insert({ ...dto, code } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)

  if (items.length > 0) {
    const rows = items.map((item, i) => ({ ...item, quotation_id: quotation.id, sort_order: i }))
    const { error: itemsError } = await supabase.from('quotation_items').insert(rows as any)
    if (itemsError) throw new Error(itemsError.message)
  }

  return quotation as Quotation
}

// ─── Sales Orders ─────────────────────────────────────────────────────────────

export async function getSalesOrders(filters: SalesOrderFilters = {}) {
  const supabase = await createClient()
  const { search, customer_id, status, date_from, date_to, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('v_sales_orders')
    .select('*', { count: 'exact' })

  if (search) query = query.ilike('code', `%${search}%`)
  if (customer_id) query = query.eq('customer_id' as any, customer_id)
  if (status) query = query.eq('status', status)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to + 'T23:59:59')

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: (data || []) as SalesOrderView[], count: count || 0 }
}

export async function getSalesOrderById(id: string) {
  const supabase = await createClient()
  const [orderResult, detailsResult] = await Promise.all([
    supabase
      .from('sales_orders')
      .select(`*, customer:customers(id, business_name, ruc), warehouse:warehouses(id, name)`)
      .eq('id', id)
      .single(),
    supabase
      .from('sales_order_details')
      .select(`*, product:products(id, name, sku, unit_measure:unit_measures(abbreviation))`)
      .eq('sales_order_id', id)
      .order('sort_order'),
  ])

  if (orderResult.error) return null
  return {
    order: orderResult.data as SalesOrder & { customer: any; warehouse: any },
    details: (detailsResult.data || []) as Array<SalesOrderDetail & { product: any }>,
  }
}

export async function createSalesOrder(
  dto: InsertDto<'sales_orders'>,
  details: InsertDto<'sales_order_details'>[]
) {
  const supabase = await createClient()
  const { data: code } = await supabase.rpc('next_document_code', { p_module: 'sales_orders' })

  const { data: order, error } = await supabase
    .from('sales_orders')
    .insert({ ...dto, code } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)

  if (details.length > 0) {
    const rows = details.map((d, i) => ({ ...d, sales_order_id: order.id, sort_order: i }))
    const { error: detailsError } = await supabase.from('sales_order_details').insert(rows as any)
    if (detailsError) throw new Error(detailsError.message)
  }

  return order as SalesOrder
}

export async function updateSalesOrderStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_orders')
    .update({ status } as any)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as SalesOrder
}

// ─── Deliveries ───────────────────────────────────────────────────────────────

export interface DeliveryItemInput {
  sales_order_detail_id?: string
  product_id: string
  batch_id?: string | null
  quantity_delivered: number
  unit_price: number
}

export async function createDelivery(
  dto: {
    sales_order_id: string
    warehouse_id: string
    delivery_date?: string
    notes?: string
    delivered_by?: string
  },
  items: DeliveryItemInput[],
  createdBy?: string
) {
  const supabase = await createClient()
  const { data: code } = await supabase.rpc('next_document_code', { p_module: 'deliveries' })

  const { data: delivery, error } = await supabase
    .from('deliveries')
    .insert({ ...dto, code, status: 'DELIVERED' } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)

  // Register Kardex EXIT for each item
  const deliveryItems = []
  for (const item of items) {
    const movementId = await registerMovement({
      product_id: item.product_id,
      warehouse_id: dto.warehouse_id,
      batch_id: item.batch_id,
      movement_type: 'EXIT',
      quantity: item.quantity_delivered,
      unit_cost: item.unit_price,
      reference_type: 'SALE',
      reference_id: delivery.id,
      notes: `Entrega ${code}`,
      created_by: createdBy,
    })

    deliveryItems.push({
      delivery_id: delivery.id,
      sales_order_detail_id: item.sales_order_detail_id || null,
      product_id: item.product_id,
      batch_id: item.batch_id || null,
      quantity_delivered: item.quantity_delivered,
      unit_price: item.unit_price,
      movement_id: movementId,
    })
  }

  const { error: itemsError } = await supabase.from('delivery_items').insert(deliveryItems as any)
  if (itemsError) throw new Error(itemsError.message)

  return delivery as Delivery
}
