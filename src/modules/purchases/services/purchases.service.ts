import { createClient } from '@/shared/lib/supabase/server'
import type {
  PurchaseOrder, PurchaseOrderView, PurchaseOrderDetail,
  GoodsReceipt, GoodsReceiptItem,
  InsertDto, UpdateDto,
} from '@/shared/types/database.types'
import { registerMovement } from '@/modules/stock-movements/services/movements.service'

export interface PurchaseOrderFilters {
  search?: string
  supplier_id?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export async function getPurchaseOrders(filters: PurchaseOrderFilters = {}) {
  const supabase = await createClient()
  const { search, supplier_id, status, date_from, date_to, page = 1, pageSize = 20 } = filters

  let query: any = supabase
    .from('v_purchase_orders')
    .select('*', { count: 'exact' })

  if (search) query = query.ilike('code', `%${search}%`)
  if (supplier_id) query = query.eq('supplier_id', supplier_id)
  if (status) query = query.eq('status', status)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to + 'T23:59:59')

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return { data: (data || []) as PurchaseOrderView[], count: count || 0 }
}

export async function getPurchaseOrderById(id: string) {
  const supabase = await createClient()
  const [orderResult, detailsResult] = await Promise.all([
    supabase
      .from('purchase_orders')
      .select(`*, supplier:suppliers(id, business_name, ruc, contact_name)`)
      .eq('id', id)
      .single(),
    supabase
      .from('purchase_order_details')
      .select(`*, product:products(id, name, sku, unit_measure:unit_measures(abbreviation))`)
      .eq('purchase_order_id', id)
      .order('sort_order'),
  ])

  if (orderResult.error) return null

  return {
    order: orderResult.data as PurchaseOrder & { supplier: any },
    details: (detailsResult.data || []) as Array<PurchaseOrderDetail & { product: any }>,
  }
}

export async function createPurchaseOrder(
  dto: InsertDto<'purchase_orders'>,
  details: InsertDto<'purchase_order_details'>[]
) {
  const supabase = await createClient()

  const { data: code, error: codeError } = await supabase.rpc('next_document_code', { p_module: 'purchase_orders' })
  if (codeError) throw new Error(codeError.message)

  const { data: order, error } = await supabase
    .from('purchase_orders')
    .insert({ ...dto, code } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)

  if (details.length > 0) {
    const detailRows = details.map((d, i) => ({ ...d, purchase_order_id: order.id, sort_order: i }))
    const { error: detailError } = await supabase.from('purchase_order_details').insert(detailRows as any)
    if (detailError) throw new Error(detailError.message)
  }

  return order as PurchaseOrder
}

export async function updatePurchaseOrderStatus(id: string, status: string, approvedBy?: string) {
  const supabase = await createClient()

  const updateData: any = { status }
  if (approvedBy) {
    updateData.approved_by = approvedBy
    updateData.approved_at = new Date().toISOString()
  }
  const { data, error } = await supabase
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)

  return data as PurchaseOrder
}

// ─── Goods Receipts ───────────────────────────────────────────────────────────

export interface GoodsReceiptItemInput {
  purchase_order_detail_id?: string
  product_id: string
  batch_id?: string | null
  quantity_received: number
  unit_cost: number
}

export async function createGoodsReceipt(
  dto: {
    purchase_order_id: string
    warehouse_id: string
    receipt_date?: string
    notes?: string
    received_by?: string
  },
  items: GoodsReceiptItemInput[],
  createdBy?: string
) {
  const supabase = await createClient()

  const { data: code, error: codeError } = await supabase.rpc('next_document_code', { p_module: 'goods_receipts' })
  if (codeError) throw new Error(codeError.message)

  const { data: receipt, error } = await supabase
    .from('goods_receipts')
    .insert({ ...dto, code, status: 'COMPLETED' } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)

  const receiptItems = []
  for (const item of items) {
    const movementId = await registerMovement({
      product_id: item.product_id,
      warehouse_id: dto.warehouse_id,
      batch_id: item.batch_id,
      movement_type: 'ENTRY',
      quantity: item.quantity_received,
      unit_cost: item.unit_cost,
      reference_type: 'PURCHASE',
      reference_id: receipt.id,
      notes: `Recepción ${code}`,
      created_by: createdBy,
    })

    receiptItems.push({
      goods_receipt_id: receipt.id,
      purchase_order_detail_id: item.purchase_order_detail_id || null,
      product_id: item.product_id,
      batch_id: item.batch_id || null,
      quantity_received: item.quantity_received,
      unit_cost: item.unit_cost,
      movement_id: movementId,
    })

    if (item.purchase_order_detail_id) {
      try {
        await supabase.rpc('rpc_update_pod_received' as any, {
          p_detail_id: item.purchase_order_detail_id,
          p_qty: item.quantity_received,
        })
      } catch { /* ignore */ }
      await supabase
        .from('purchase_order_details')
        .update({ quantity_received: item.quantity_received } as any)
        .eq('id', item.purchase_order_detail_id)
    }
  }

  const { error: itemsError } = await supabase.from('goods_receipt_items').insert(receiptItems as any)
  if (itemsError) throw new Error(itemsError.message)

  return receipt as GoodsReceipt
}

export async function getGoodsReceipts(purchaseOrderId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('goods_receipts')
    .select(`*, purchase_order:purchase_orders(code), warehouse:warehouses(name)`)
    .order('created_at', { ascending: false })

  if (purchaseOrderId) query = query.eq('purchase_order_id', purchaseOrderId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data || []
}
