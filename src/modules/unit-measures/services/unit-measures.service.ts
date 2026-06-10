import { createClient } from '@/shared/lib/supabase/server'
import type { UnitMeasure, InsertDto, UpdateDto } from '@/shared/types/database.types'

export async function getUnitMeasures() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('unit_measures')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data as UnitMeasure[]
}

export async function createUnitMeasure(dto: InsertDto<'unit_measures'>): Promise<UnitMeasure> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('unit_measures')
    .insert(dto as any)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateUnitMeasure(id: string, dto: UpdateDto<'unit_measures'>): Promise<UnitMeasure> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('unit_measures')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteUnitMeasure(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('unit_measures')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}
