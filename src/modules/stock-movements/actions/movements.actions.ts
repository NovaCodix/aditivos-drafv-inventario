'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'
import { registerMovement } from '@/modules/stock-movements/services/movements.service'

export async function createMovementAction(formData: FormData) {
  const productId = formData.get('product_id') as string
  const warehouseId = formData.get('warehouse_id') as string
  const batchId = formData.get('batch_id') as string || null
  const locationId = formData.get('location_id') as string || null
  const movementType = formData.get('movement_type') as 'ENTRY' | 'EXIT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT'
  const quantity = Number(formData.get('quantity')) || 0
  const unitCost = Number(formData.get('unit_cost')) || null
  const notes = formData.get('notes') as string || null

  if (!productId || !warehouseId || !movementType || quantity <= 0) {
    return { success: false, error: 'Campos requeridos inválidos o cantidad no puede ser menor o igual a cero' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    await registerMovement({
      product_id: productId,
      warehouse_id: warehouseId,
      batch_id: batchId,
      location_id: locationId,
      movement_type: movementType,
      quantity,
      unit_cost: unitCost,
      notes,
      created_by: user?.id || null,
      reference_type: 'ADJUSTMENT'
    })

    revalidatePath('/movements')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al registrar el movimiento' }
  }
}
