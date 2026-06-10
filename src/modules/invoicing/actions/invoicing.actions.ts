'use server'

import { revalidatePath } from 'next/cache'
import { createInvoice, updateInvoiceStatus } from '@/modules/invoicing/services/invoicing.service'
import { createClient } from '@/shared/lib/supabase/server'
import type { InsertDto } from '@/shared/types/database.types'

export async function createInvoiceAction(
  data: {
    invoice_series?: string
    invoice_number: string
    customer_id: string
    sales_order_id?: string
    issue_date?: string
    due_date?: string
    tax_rate?: number
    currency?: 'PEN' | 'USD'
    payment_method?: string
    notes?: string
  },
  details: Array<{
    product_id?: string
    description: string
    quantity: number
    unit_price: number
    discount_pct?: number
    tax_rate?: number
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const taxRate = data.tax_rate ?? 18
  const subtotal = details.reduce((sum, d) => {
    return sum + d.quantity * d.unit_price * (1 - (d.discount_pct || 0) / 100)
  }, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  try {
    const invoice = await createInvoice(
      {
        invoice_series: data.invoice_series || 'F001',
        invoice_number: data.invoice_number,
        customer_id: data.customer_id,
        sales_order_id: data.sales_order_id || null,
        status: 'DRAFT',
        issue_date: data.issue_date || new Date().toISOString().slice(0, 10),
        due_date: data.due_date || null,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        currency: (data.currency as any) || 'PEN',
        payment_method: (data.payment_method as any) || 'CASH',
        notes: data.notes || null,
        created_by: user?.id,
      },
      details.map((d, i) => ({
        product_id: d.product_id || null,
        description: d.description,
        quantity: d.quantity,
        unit_price: d.unit_price,
        discount_pct: d.discount_pct ?? 0,
        tax_rate: d.tax_rate ?? taxRate,
        subtotal: d.quantity * d.unit_price * (1 - (d.discount_pct ?? 0) / 100),
        tax_amount: d.quantity * d.unit_price * (1 - (d.discount_pct ?? 0) / 100) * ((d.tax_rate ?? taxRate) / 100),
        total: d.quantity * d.unit_price * (1 - (d.discount_pct ?? 0) / 100) * (1 + (d.tax_rate ?? taxRate) / 100),
        sort_order: i,
      })) as any[]
    )
    revalidatePath('/invoicing')
    return { success: true, data: invoice }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la factura' }
  }
}

export async function issueInvoiceAction(id: string) {
  try {
    const invoice = await updateInvoiceStatus(id, 'ISSUED')
    revalidatePath('/invoicing')
    return { success: true, data: invoice }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al emitir la factura' }
  }
}

export async function markInvoicePaidAction(id: string) {
  try {
    const invoice = await updateInvoiceStatus(id, 'PAID', new Date().toISOString())
    revalidatePath('/invoicing')
    return { success: true, data: invoice }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al marcar como pagada' }
  }
}

export async function voidInvoiceAction(id: string) {
  try {
    const invoice = await updateInvoiceStatus(id, 'VOIDED')
    revalidatePath('/invoicing')
    return { success: true, data: invoice }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al anular la factura' }
  }
}
