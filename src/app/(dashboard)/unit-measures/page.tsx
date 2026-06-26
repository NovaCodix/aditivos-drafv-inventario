import type { Metadata } from 'next'
import { getUnitMeasures } from '@/modules/unit-measures/services/unit-measures.service'
import { UnitMeasuresClient } from '@/modules/unit-measures/components/unit-measures-client'

export const metadata: Metadata = { title: 'Unidades de Medida' }

export default async function UnitMeasuresPage() {
  const unitMeasures = await getUnitMeasures()

  return (
    <UnitMeasuresClient initialUnitMeasures={unitMeasures} />
  )
}
