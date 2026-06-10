import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUnitMeasures } from '@/modules/unit-measures/services/unit-measures.service'

export const metadata: Metadata = { title: 'Unidades de Medida' }

export default async function UnitMeasuresPage() {
  const unitMeasures = await getUnitMeasures()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unidades de Medida</h1>
          <p className="text-muted-foreground text-sm mt-1">Unidades de medida para productos</p>
        </div>
        <Button id="create-unit-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Unidad
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {unitMeasures.map(um => (
          <Card
            key={um.id}
            className="text-center hover:shadow-md transition-all hover:border-primary/30"
            id={`unit-${um.id}`}
          >
            <CardContent className="pt-5 pb-4">
              <div className="text-3xl font-bold text-primary mb-2 font-mono">
                {um.abbreviation}
              </div>
              <p className="text-xs font-medium">{um.name}</p>
              {um.description && (
                <p className="text-[10px] text-muted-foreground mt-1">{um.description}</p>
              )}
              <Badge
                variant={um.is_active ? 'default' : 'secondary'}
                className="text-[10px] mt-2"
              >
                {um.is_active ? 'Activa' : 'Inactiva'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
