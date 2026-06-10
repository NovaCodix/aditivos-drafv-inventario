'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createCustomer, updateCustomer, deleteCustomer } from '@/modules/customers/services/customers.service'

const customerSchema = z.object({
  business_name: z.string().min(2, 'Razón social requerida'),
  ruc: z.string().optional().nullable(),
  contact_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default('Perú'),
  customer_type: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'GOVERNMENT', 'OTHER']).default('RETAIL'),
  credit_days: z.number().min(0).default(0),
  credit_limit: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

export async function createCustomerAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = customerSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
    credit_days: Number(rawData.credit_days) || 0,
    credit_limit: Number(rawData.credit_limit) || 0,
    email: rawData.email || null,
    ruc: rawData.ruc || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const customer = await createCustomer(parsed.data)
    revalidatePath('/customers')
    return { success: true, data: customer }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear el cliente' }
  }
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const parsed = customerSchema.safeParse({
    ...rawData,
    is_active: rawData.is_active === 'true',
    credit_days: Number(rawData.credit_days) || 0,
    credit_limit: Number(rawData.credit_limit) || 0,
    email: rawData.email || null,
    ruc: rawData.ruc || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
  }

  try {
    const customer = await updateCustomer(id, parsed.data)
    revalidatePath('/customers')
    return { success: true, data: customer }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar el cliente' }
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await deleteCustomer(id)
    revalidatePath('/customers')
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar el cliente' }
  }
}
