import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getBrands } from '@/modules/brands/services/brands.service'

export const metadata: Metadata = { title: 'Marcas' }

async function BrandsContent() {
  const brands = await getBrands()

  return (
    <Card>
      <CardContent className="pt-6">
        {brands.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No hay marcas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {brands.map(brand => (
              <div
                key={brand.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors group"
                id={`brand-${brand.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{brand.name}</p>
                    <Badge variant={brand.is_active ? 'default' : 'secondary'} className="text-[10px] mt-0.5">
                      {brand.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function BrandsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marcas</h1>
          <p className="text-muted-foreground text-sm mt-1">Marcas de productos</p>
        </div>
        <Button id="create-brand-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Marca
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <BrandsContent />
      </Suspense>
    </div>
  )
}
