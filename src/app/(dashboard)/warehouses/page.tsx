import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'

export const metadata: Metadata = { title: 'Almacenes' }

async function WarehousesContent() {
  const warehouses = await getWarehouses()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {warehouses.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          <p className="text-sm">No hay almacenes registrados</p>
        </div>
      ) : (
        warehouses.map(warehouse => (
          <Card
            key={warehouse.id}
            className="hover:shadow-md transition-all"
            id={`warehouse-${warehouse.id}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                  <WarehouseIcon className="w-5 h-5 text-white" />
                </div>
                <Badge variant={warehouse.is_active ? 'default' : 'secondary'} className="text-xs">
                  {warehouse.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <h3 className="font-semibold">{warehouse.name}</h3>
              {warehouse.description && (
                <p className="text-sm text-muted-foreground mt-1">{warehouse.description}</p>
              )}
              {warehouse.address && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  📍 {warehouse.address}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" render={<a href={`/locations?warehouse_id=${warehouse.id}`} id={`warehouse-locations-${warehouse.id}`} />}>
                    Ver Ubicaciones
                </Button>
                <Button variant="outline" size="sm" className="flex-1" render={<a href={`/warehouses/${warehouse.id}/edit`} id={`edit-warehouse-${warehouse.id}`} />}>
                    Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export default function WarehousesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Almacenes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de almacenes y depósitos</p>
        </div>
        <Button id="create-warehouse-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Almacén
        </Button>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      }>
        <WarehousesContent />
      </Suspense>
    </div>
  )
}
