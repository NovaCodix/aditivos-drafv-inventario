import { createClient } from '@/shared/lib/supabase/server'
import type { Invoice, InvoiceView, InvoiceDetail, InsertDto, UpdateDto } from '@/shared/types/database.types'

export interface InvoiceFilters {
  search?: string
  customer_id?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
}

export async function getInvoices(filters: InvoiceFilters = {}) {
  const supabase = await createClient()
  const { search, customer_id, status, date_from, date_to, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('v_invoices')
    .select('*', { count: 'exact' })

  if (search) query = (query as any).or(`invoice_number.ilike.%${search}%,customer_name.ilike.%${search}%`)
  if (customer_id) query = (query as any).eq('customer_id', customer_id)
  if (status) query = query.eq('status', status)
  if (date_from) query = query.gte('issue_date', date_from)
  if (date_to) query = query.lte('issue_date', date_to)

  query = query
    .order('issue_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return { data: (data || []) as InvoiceView[], count: count || 0 }
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient()
  const [invoiceResult, detailsResult] = await Promise.all([
    supabase
      .from('invoices')
      .select(`*, customer:customers(id, business_name, ruc, address)`)
      .eq('id', id)
      .single(),
    supabase
      .from('invoice_details')
      .select('*')
      .eq('invoice_id', id)
      .order('sort_order'),
  ])

  if (invoiceResult.error) return null

  return {
    invoice: invoiceResult.data as Invoice & { customer: any },
    details: (detailsResult.data || []) as InvoiceDetail[],
  }
}

export async function createInvoice(
  dto: InsertDto<'invoices'>,
  details: InsertDto<'invoice_details'>[]
) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert(dto as any)
    .select()
    .single()
  if (error) throw new Error(error.message)

  if (details.length > 0) {
    const rows = details.map((d, i) => ({ ...d, invoice_id: invoice.id, sort_order: i }))
    const { error: detailsError } = await supabase.from('invoice_details').insert(rows as any)
    if (detailsError) throw new Error(detailsError.message)
  }

  return invoice as Invoice
}

export async function updateInvoiceStatus(id: string, status: string, paidAt?: string) {
  const supabase = await createClient()

  const updateData: any = { status }
  if (paidAt) updateData.paid_at = paidAt
  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)

  return data as Invoice
}

export async function getInvoiceSummary() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('v_invoices')
    .select('status, total, currency, is_overdue') as any

  if (error) throw new Error((error as any).message)
  const invoices: Array<{ status: string; total: number; currency: string; is_overdue: boolean }> = data || []

  return {
    total_issued: invoices.filter(i => i.status === 'ISSUED').reduce((s, i) => s + (i.total || 0), 0),
    total_paid: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.total || 0), 0),
    total_overdue: invoices.filter(i => i.is_overdue).reduce((s, i) => s + (i.total || 0), 0),
    count_draft: invoices.filter(i => i.status === 'DRAFT').length,
    count_issued: invoices.filter(i => i.status === 'ISSUED').length,
    count_paid: invoices.filter(i => i.status === 'PAID').length,
  }
}
