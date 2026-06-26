'use server'

import { revalidatePath } from 'next/cache'
import { brandSchema } from '@/shared/schemas'
import { createBrand, updateBrand, deleteBrand } from '@/modules/brands/services/brands.service'

export async function createBrandAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = brandSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const brand = await createBrand(parsed.data)
    revalidatePath('/brands')
    return { success: true, data: brand }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la marca' }
  }
}

export async function updateBrandAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = brandSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const brand = await updateBrand(id, parsed.data)
    revalidatePath('/brands')
    return { success: true, data: brand }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar la marca' }
  }
}

export async function deleteBrandAction(id: string) {
  try {
    await deleteBrand(id)
    revalidatePath('/brands')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar la marca' }
  }
}
