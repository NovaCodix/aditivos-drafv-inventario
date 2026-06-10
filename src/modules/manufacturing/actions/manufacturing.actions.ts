'use server'

import { revalidatePath } from 'next/cache'
import {
  createBom,
  createProductionOrder,
  startProductionOrder,
  completeProductionOrder,
} from '@/modules/manufacturing/services/manufacturing.service'
import { createClient } from '@/shared/lib/supabase/server'

export async function createBomAction(
  data: {
    product_id: string
    name: string
    version?: string
    output_quantity?: number
    unit_measure_id?: string
    notes?: string
  },
  items: Array<{
    product_id: string
    quantity: number
    unit_measure_id?: string
    is_optional?: boolean
    scrap_pct?: number
    notes?: string
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  try {
    const bom = await createBom(
      { ...data, created_by: user?.id } as any,
      items as any
    )
    revalidatePath('/bill-of-materials')
    return { success: true, data: bom }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la lista de materiales' }
  }
}

export async function createProductionOrderAction(data: {
  bom_id: string
  warehouse_id: string
  quantity_planned: number
  planned_start?: string
  planned_end?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  try {
    const order = await createProductionOrder({
      bom_id: data.bom_id,
      warehouse_id: data.warehouse_id,
      status: 'DRAFT',
      quantity_planned: data.quantity_planned,
      planned_start: data.planned_start,
      planned_end: data.planned_end,
      notes: data.notes,
      created_by: user?.id,
    } as any)
    revalidatePath('/production-orders')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la orden de producción' }
  }
}

export async function startProductionOrderAction(id: string) {
  try {
    const order = await startProductionOrder(id)
    revalidatePath('/production-orders')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al iniciar la producción' }
  }
}

export async function completeProductionOrderAction(
  id: string,
  warehouseId: string,
  consumptions: Array<{
    consumption_id: string
    product_id: string
    batch_id?: string | null
    quantity_consumed: number
    unit_cost?: number
  }>,
  outputs: Array<{
    product_id: string
    batch_id?: string | null
    quantity_produced: number
    unit_cost?: number
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  try {
    const order = await completeProductionOrder(id, {
      warehouse_id: warehouseId,
      consumptions,
      outputs,
      created_by: user?.id,
    })
    revalidatePath('/production-orders')
    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al completar la producción' }
  }
}
