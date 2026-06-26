'use server'

import { revalidatePath } from 'next/cache'
import { warehouseSchema } from '@/shared/schemas'
import { createWarehouse, updateWarehouse, deleteWarehouse } from '@/modules/warehouses/services/warehouses.service'

export async function createWarehouseAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = warehouseSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
    manager_id: rawData.manager_id || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const wh = await createWarehouse(parsed.data)
    revalidatePath('/warehouses')
    return { success: true, data: wh }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear el almacén' }
  }
}

export async function updateWarehouseAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = warehouseSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
    manager_id: rawData.manager_id || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const wh = await updateWarehouse(id, parsed.data)
    revalidatePath('/warehouses')
    return { success: true, data: wh }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar el almacén' }
  }
}

export async function deleteWarehouseAction(id: string) {
  try {
    await deleteWarehouse(id)
    revalidatePath('/warehouses')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al desactivar el almacén' }
  }
}
