import type { Metadata } from 'next'
import { getCategories } from '@/modules/categories/services/categories.service'
import { CategoriesClient } from '@/modules/categories/components/categories-client'

export const metadata: Metadata = { title: 'Categorías' }

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <CategoriesClient initialCategories={categories} />
  )
}
