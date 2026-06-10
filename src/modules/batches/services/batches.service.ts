import { createClient } from '@/shared/lib/supabase/server'
import type { Batch, InsertDto, UpdateDto } from '@/shared/types/database.types'

export interface BatchWithProduct extends Batch {
  product?: { id: string; name: string; sku: string } | null
}

export interface BatchFilters {
  product_id?: string
  search?: string
  is_active?: boolean
  page?: number
  pageSize?: number
}

export async function getBatches(filters: BatchFilters = {}) {
  const supabase = await createClient()
  const { product_id, search, is_active, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('batches')
    .select(`
      *,
      product:products(id, name, sku)
    `, { count: 'exact' })

  if (product_id) query = query.eq('product_id', product_id)
  if (search) query = query.ilike('batch_number', `%${search}%`)
  if (is_active !== undefined) query = query.eq('is_active', is_active)

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data: data as BatchWithProduct[], count: count || 0 }
}

export async function createBatch(dto: InsertDto<'batches'>): Promise<Batch> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('batches')
    .insert(dto as any)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBatch(id: string, dto: UpdateDto<'batches'>): Promise<Batch> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batches')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteBatch(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('batches')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getBatchesForProduct(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batches')
    .select('id, batch_number, expiration_date, quantity')
    .eq('product_id', productId)
    .eq('is_active', true)
    .gt('quantity', 0)
    .order('expiration_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}
