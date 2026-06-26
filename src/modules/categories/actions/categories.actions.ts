'use server'

import { revalidatePath } from 'next/cache'
import { categorySchema } from '@/shared/schemas'
import { createCategory, updateCategory, deleteCategory } from '@/modules/categories/services/categories.service'

export async function createCategoryAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = categorySchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
    sort_order: Number(rawData.sort_order) || 0,
    parent_id: rawData.parent_id || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const category = await createCategory(parsed.data)
    revalidatePath('/categories')
    return { success: true, data: category }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la categoría' }
  }
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = categorySchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
    sort_order: Number(rawData.sort_order) || 0,
    parent_id: rawData.parent_id || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const category = await updateCategory(id, parsed.data)
    revalidatePath('/categories')
    return { success: true, data: category }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar la categoría' }
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await deleteCategory(id)
    revalidatePath('/categories')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar la categoría' }
  }
}
