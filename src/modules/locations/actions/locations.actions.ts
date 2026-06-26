'use server'

import { revalidatePath } from 'next/cache'
import { locationSchema } from '@/shared/schemas'
import { createLocation, updateLocation, deleteLocation } from '@/modules/locations/services/locations.service'

export async function createLocationAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = locationSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const loc = await createLocation(parsed.data)
    revalidatePath('/locations')
    return { success: true, data: loc }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la ubicación' }
  }
}

export async function updateLocationAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = locationSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const loc = await updateLocation(id, parsed.data)
    revalidatePath('/locations')
    return { success: true, data: loc }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar la ubicación' }
  }
}

export async function deleteLocationAction(id: string) {
  try {
    await deleteLocation(id)
    revalidatePath('/locations')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al desactivar la ubicación' }
  }
}
