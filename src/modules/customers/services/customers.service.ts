import { createClient } from '@/shared/lib/supabase/server'
import type { Customer, InsertDto, UpdateDto } from '@/shared/types/database.types'

export interface CustomerFilters {
  search?: string
  customer_type?: string
  is_active?: boolean
  page?: number
  pageSize?: number
}

export async function getCustomers(filters: CustomerFilters = {}) {
  const supabase = await createClient()
  const { search, customer_type, is_active, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.or(`business_name.ilike.%${search}%,ruc.ilike.%${search}%,contact_name.ilike.%${search}%`)
  }
  if (customer_type) query = query.eq('customer_type', customer_type)
  if (is_active !== undefined) query = query.eq('is_active', is_active)

  query = query
    .order('business_name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: (data || []) as Customer[], count: count || 0 }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Customer
}

export async function createCustomer(dto: InsertDto<'customers'>): Promise<Customer> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .insert(dto as any)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateCustomer(id: string, dto: UpdateDto<'customers'>): Promise<Customer> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .update({ is_active: false } as any)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getCustomersForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('id, business_name, ruc')
    .eq('is_active', true)
    .order('business_name')
  if (error) throw new Error(error.message)
  return data || []
}
