'use server'

import { revalidatePath } from 'next/cache'
import { unitMeasureSchema } from '@/shared/schemas'
import { createUnitMeasure, updateUnitMeasure, deleteUnitMeasure } from '@/modules/unit-measures/services/unit-measures.service'

export async function createUnitMeasureAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = unitMeasureSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const um = await createUnitMeasure(parsed.data)
    revalidatePath('/unit-measures')
    return { success: true, data: um }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la unidad' }
  }
}

export async function updateUnitMeasureAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = unitMeasureSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const um = await updateUnitMeasure(id, parsed.data)
    revalidatePath('/unit-measures')
    return { success: true, data: um }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar la unidad' }
  }
}

export async function deleteUnitMeasureAction(id: string) {
  try {
    await deleteUnitMeasure(id)
    revalidatePath('/unit-measures')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al desactivar la unidad' }
  }
}
