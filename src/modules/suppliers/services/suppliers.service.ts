import { createClient } from '@/shared/lib/supabase/server'
import type { Supplier, InsertDto, UpdateDto } from '@/shared/types/database.types'

export interface SupplierFilters {
  search?: string
  is_active?: boolean
  page?: number
  pageSize?: number
}

export async function getSuppliers(filters: SupplierFilters = {}) {
  const supabase = await createClient()
  const { search, is_active, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('suppliers')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.or(
      `business_name.ilike.%${search}%,ruc.ilike.%${search}%,contact_name.ilike.%${search}%`
    )
  }
  if (is_active !== undefined) query = query.eq('is_active', is_active)

  query = query
    .order('business_name')
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: data as Supplier[], count: count || 0 }
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createSupplier(dto: InsertDto<'suppliers'>): Promise<Supplier> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('suppliers')
    .insert(dto as any)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateSupplier(id: string, dto: UpdateDto<'suppliers'>): Promise<Supplier> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}
