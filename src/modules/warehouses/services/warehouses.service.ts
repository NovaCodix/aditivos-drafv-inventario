import { createClient } from '@/shared/lib/supabase/server'
import type { Warehouse, InsertDto, UpdateDto } from '@/shared/types/database.types'

export async function getWarehouses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data as Warehouse[]
}

export async function getWarehouseById(id: string): Promise<Warehouse | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createWarehouse(dto: InsertDto<'warehouses'>): Promise<Warehouse> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .insert(dto as any)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateWarehouse(id: string, dto: UpdateDto<'warehouses'>): Promise<Warehouse> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteWarehouse(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('warehouses')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}
