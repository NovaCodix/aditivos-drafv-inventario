import { createClient } from '@/shared/lib/supabase/server'
import type { Product, InsertDto, UpdateDto } from '@/shared/types/database.types'

export interface ProductWithRelations extends Product {
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  unit_measure?: { id: string; name: string; abbreviation: string } | null
}

export interface ProductFilters {
  search?: string
  category_id?: string
  brand_id?: string
  is_active?: boolean
  page?: number
  pageSize?: number
}

export async function getProducts(filters: ProductFilters = {}) {
  const supabase = await createClient()
  const { search, category_id, brand_id, is_active, page = 1, pageSize = 20 } = filters

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      brand:brands(id, name),
      unit_measure:unit_measures(id, name, abbreviation)
    `, { count: 'exact' })

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
  }
  if (category_id) query = query.eq('category_id', category_id)
  if (brand_id) query = query.eq('brand_id', brand_id)
  if (is_active !== undefined) query = query.eq('is_active', is_active)

  query = query
    .order('name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query

  if (error) throw new Error(error.message)
  return { data: data as ProductWithRelations[], count: count || 0 }
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      brand:brands(id, name),
      unit_measure:unit_measures(id, name, abbreviation)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data as ProductWithRelations
}

export async function createProduct(dto: InsertDto<'products'>): Promise<Product> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('products')
    .insert(dto as any)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateProduct(id: string, dto: UpdateDto<'products'>): Promise<Product> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient()
  // Soft delete
  const { error } = await supabase
    .from('products')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getProductsForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, unit_measure:unit_measures(abbreviation)')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}
