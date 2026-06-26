'use server'

import { revalidatePath } from 'next/cache'
import {
  createSalesOrder,
  updateSalesOrderStatus,
  createDelivery,
  type DeliveryItemInput,
} from '@/modules/sales/services/sales.service'
import { createClient } from '@/shared/lib/supabase/server'

export async function createSalesOrderAction(
  customerId: string,
  warehouseId: string,
  data: {
    delivery_date?: string
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
    const order = await createSalesOrder(
      {
        customer_id: customerId,
        warehouse_id: warehouseId,
        status: 'CONFIRMED',
        delivery_date: data.delivery_date,
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
        quantity_delivered: 0,
        unit_price: d.unit_price,
        discount_pct: d.discount_pct ?? 0,
        subtotal: d.quantity_ordered * d.unit_price * (1 - (d.discount_pct ?? 0) / 100),
      })) as any
    )
    revalidatePath('/sales')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la orden de venta' }
  }
}

export async function processSalesOrderAction(id: string) {
  try {
    const order = await updateSalesOrderStatus(id, 'PROCESSING')
    revalidatePath('/sales')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al procesar la orden' }
  }
}

export async function cancelSalesOrderAction(id: string) {
  try {
    const order = await updateSalesOrderStatus(id, 'CANCELLED')
    revalidatePath('/sales')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al cancelar la orden' }
  }
}

export async function createDeliveryAction(
  salesOrderId: string,
  warehouseId: string,
  items: DeliveryItemInput[],
  notes?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  try {
    const delivery = await createDelivery(
      {
        sales_order_id: salesOrderId,
        warehouse_id: warehouseId,
        notes: notes,
        delivered_by: user?.id,
      },
      items,
      user?.id
    )
    revalidatePath('/sales')
    return { success: true, data: delivery }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al registrar la entrega' }
  }
}
