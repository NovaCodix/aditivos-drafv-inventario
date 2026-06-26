'use server'

import { revalidatePath } from 'next/cache'
import { supplierSchema } from '@/shared/schemas'
import { createSupplier, updateSupplier, deleteSupplier } from '@/modules/suppliers/services/suppliers.service'

export async function createSupplierAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = supplierSchema.safeParse({
    ...rawData,
    credit_days: Number(rawData.credit_days) || 0,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const supplier = await createSupplier(parsed.data)
    revalidatePath('/suppliers')
    return { success: true, data: supplier }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear el proveedor' }
  }
}

export async function updateSupplierAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = supplierSchema.safeParse({
    ...rawData,
    credit_days: Number(rawData.credit_days) || 0,
    is_active: rawData.is_active === 'true',
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const supplier = await updateSupplier(id, parsed.data)
    revalidatePath('/suppliers')
    return { success: true, data: supplier }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar el proveedor' }
  }
}

export async function deleteSupplierAction(id: string) {
  try {
    await deleteSupplier(id)
    revalidatePath('/suppliers')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al desactivar el proveedor' }
  }
}
