import { createClient } from '@/shared/lib/supabase/server'
import type { Location, InsertDto, UpdateDto } from '@/shared/types/database.types'

export interface LocationWithWarehouse extends Location {
  warehouse?: { id: string; name: string } | null
}

export async function getLocations(warehouseId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('locations')
    .select('*, warehouse:warehouses(id, name)')
    .eq('is_active', true)
    .order('code')

  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as LocationWithWarehouse[]
}

export async function createLocation(dto: InsertDto<'locations'>): Promise<Location> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('locations')
    .insert(dto as any)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateLocation(id: string, dto: UpdateDto<'locations'>): Promise<Location> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('locations')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteLocation(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('locations')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}
