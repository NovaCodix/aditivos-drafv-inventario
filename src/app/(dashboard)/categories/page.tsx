import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, Pencil, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getCategories } from '@/modules/categories/services/categories.service'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Categorías' }

async function CategoriesContent() {
  const categories = await getCategories()

  return (
    <Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden !p-0 gap-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nombre</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Descripción</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Subcategoría De</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Tag className="w-10 h-10 opacity-20" />
                      <p className="text-sm">No hay categorías registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr
                    key={cat.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    id={`category-${cat.id}`}
                  >
                    <td className="py-3 px-4 text-left font-medium text-xs">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-left text-xs text-muted-foreground max-w-[200px] truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                      {cat.parent ? (cat.parent as { name: string }).name : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={cat.is_active ? 'default' : 'secondary'} className="text-xs inline-flex justify-center">
                        {cat.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" id={`edit-category-${cat.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <DataTablePagination totalItems={categories.length} />
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
