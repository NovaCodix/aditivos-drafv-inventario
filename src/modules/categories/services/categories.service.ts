import { createClient } from '@/shared/lib/supabase/server'
import type { Category, InsertDto, UpdateDto } from '@/shared/types/database.types'

export interface CategoryWithParent extends Category {
  parent?: { id: string; name: string } | null
  children?: Category[]
}

export async function getCategories(parentId?: string | null) {
  const supabase = await createClient()
  let query = supabase
    .from('categories')
    .select('*, parent:categories!parent_id(id, name)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (parentId !== undefined) {
    if (parentId === null) {
      query = query.is('parent_id', null)
    } else {
      query = query.eq('parent_id', parentId)
    }
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as CategoryWithParent[]
}

export async function getCategoryById(id: string): Promise<CategoryWithParent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, parent:categories!parent_id(id, name)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as CategoryWithParent
}

export async function createCategory(dto: InsertDto<'categories'>): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .insert(dto as any)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateCategory(id: string, dto: UpdateDto<'categories'>): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .update(dto as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .update({ is_active: false } as any)
    .eq('id', id)

  if (error) throw new Error(error.message)
}
