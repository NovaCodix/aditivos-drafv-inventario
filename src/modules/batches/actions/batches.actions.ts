'use server'

import { revalidatePath } from 'next/cache'
import { batchSchema } from '@/shared/schemas'
import { createBatch, updateBatch, deleteBatch } from '@/modules/batches/services/batches.service'

export async function createBatchAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = batchSchema.safeParse({
    ...rawData,
    quantity: Number(rawData.quantity) || 0,
    manufacture_date: rawData.manufacture_date || null,
    expiration_date: rawData.expiration_date || null,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const batch = await createBatch(parsed.data)
    revalidatePath('/batches')
    return { success: true, data: batch }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear el lote' }
  }
}

export async function updateBatchAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = batchSchema.safeParse({
    ...rawData,
    quantity: Number(rawData.quantity) || 0,
    manufacture_date: rawData.manufacture_date || null,
    expiration_date: rawData.expiration_date || null,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const batch = await updateBatch(id, parsed.data)
    revalidatePath('/batches')
    return { success: true, data: batch }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar el lote' }
  }
}

export async function deleteBatchAction(id: string) {
  try {
    await deleteBatch(id)
    revalidatePath('/batches')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al desactivar el lote' }
  }
}
