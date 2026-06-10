import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getCategories } from '@/modules/categories/services/categories.service'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Categorías' }

async function CategoriesContent() {
  const categories = await getCategories()

  return (
    <Card>
      <CardContent className="pt-6">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No hay categorías registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                id={`category-${cat.id}`}
              >
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  )}
                  {cat.parent && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Subcategoría de: <span className="text-foreground">{(cat.parent as { name: string }).name}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cat.is_active ? 'default' : 'secondary'} className="text-xs">
                    {cat.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                  <Button variant="outline" size="sm" render={<Link href={`/categories/${cat.id}/edit`} id={`edit-category-${cat.id}`} />}>
                      Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function CategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organización jerárquica de productos
          </p>
        </div>
        <Button id="create-category-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <CategoriesContent />
      </Suspense>
    </div>
  )
}
