import { createClient } from '@/shared/lib/supabase/server'
import type { Brand, InsertDto, UpdateDto } from '@/shared/types/database.types'

export async function getBrands() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data as Brand[]
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createBrand(dto: InsertDto<'brands'>): Promise<Brand> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .insert(dto as any)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBrand(id: string, dto: UpdateDto<'brands'>): Promise<Brand> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brands')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteBrand(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('brands')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}
