'use server'

import { revalidatePath } from 'next/cache'
import { productSchema } from '@/shared/schemas'
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/modules/products/services/products.service'

export async function createProductAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = productSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
    purchase_price: Number(rawData.purchase_price),
    sale_price: Number(rawData.sale_price),
    category_id: rawData.category_id || null,
    brand_id: rawData.brand_id || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const product = await createProduct(parsed.data)
    revalidatePath('/products')
    return { success: true, data: product }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear el producto' }
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = productSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
    purchase_price: Number(rawData.purchase_price),
    sale_price: Number(rawData.sale_price),
    category_id: rawData.category_id || null,
    brand_id: rawData.brand_id || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const product = await updateProduct(id, parsed.data)
    revalidatePath('/products')
    revalidatePath(`/products/${id}`)
    return { success: true, data: product }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar el producto' }
  }
}

export async function deleteProductAction(id: string) {
  try {
    await deleteProduct(id)
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar el producto' }
  }
}
