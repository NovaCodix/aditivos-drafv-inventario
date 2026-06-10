'use server'

import { revalidatePath } from 'next/cache'
import {
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  createGoodsReceipt,
  type GoodsReceiptItemInput,
} from '@/modules/purchases/services/purchases.service'
import { createClient } from '@/shared/lib/supabase/server'

export async function createPurchaseOrderAction(
  supplierId: string,
  data: {
    expected_date?: string
    notes?: string
    tax_rate?: number
    currency?: 'PEN' | 'USD'
    exchange_rate?: number
  },
  details: Array<{
    product_id: string
    quantity_ordered: number
    unit_price: number
    discount_pct?: number
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const subtotal = details.reduce((sum, d) => {
    return sum + d.quantity_ordered * d.unit_price * (1 - (d.discount_pct || 0) / 100)
  }, 0)
  const taxRate = data.tax_rate ?? 18
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  try {
    const order = await createPurchaseOrder(
      {
        supplier_id: supplierId,
        status: 'DRAFT',
        expected_date: data.expected_date,
        notes: data.notes,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        currency: data.currency ?? 'PEN',
        exchange_rate: data.exchange_rate ?? 1,
        created_by: user?.id,
      } as any,
      details.map(d => ({
        product_id: d.product_id,
        quantity_ordered: d.quantity_ordered,
        quantity_received: 0,
        unit_price: d.unit_price,
        discount_pct: d.discount_pct ?? 0,
        subtotal: d.quantity_ordered * d.unit_price * (1 - (d.discount_pct ?? 0) / 100),
      })) as any
    )
    revalidatePath('/purchases')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la orden de compra' }
  }
}

export async function approvePurchaseOrderAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  try {
    const order = await updatePurchaseOrderStatus(id, 'SENT', user?.id)
    revalidatePath('/purchases')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al aprobar la orden' }
  }
}

export async function cancelPurchaseOrderAction(id: string) {
  try {
    const order = await updatePurchaseOrderStatus(id, 'CANCELLED')
    revalidatePath('/purchases')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al cancelar la orden' }
  }
}

export async function createGoodsReceiptAction(
  purchaseOrderId: string,
  warehouseId: string,
  items: GoodsReceiptItemInput[],
  notes?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  try {
    const receipt = await createGoodsReceipt(
      {
        purchase_order_id: purchaseOrderId,
        warehouse_id: warehouseId,
        notes: notes,
        received_by: user?.id,
      },
      items,
      user?.id
    )
    revalidatePath('/purchases')
    return { success: true, data: receipt }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al registrar la recepción' }
  }
}
