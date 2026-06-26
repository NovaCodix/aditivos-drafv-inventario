'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createProductAction, updateProductAction } from '../actions/products.actions'
import type { Category, Brand, UnitMeasure, Product } from '@/shared/types/database.types'

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  brands: Brand[]
  unitMeasures: UnitMeasure[]
}

export function ProductForm({ product, categories, brands, unitMeasures }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = product
        ? await updateProductAction(product.id, formData)
        : await createProductAction(formData)

      if (res.success) {
        toast.success(product ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente')
        router.push('/products')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre del Producto</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name || ''}
            required
            placeholder="Ej. Aditivo Estabilizante X-100"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            name="sku"
            defaultValue={product?.sku || ''}
            required
            placeholder="Ej. AD-EST-100"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="barcode">Código de Barras (Opcional)</Label>
          <Input
            id="barcode"
            name="barcode"
            defaultValue={product?.barcode || ''}
            placeholder="Ej. 7750123456789"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="unit_measure_id">Unidad de Medida</Label>
          <select
            id="unit_measure_id"
            name="unit_measure_id"
            defaultValue={product?.unit_measure_id || ''}
            required
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Seleccione una unidad...</option>
            {unitMeasures.map(um => (
              <option key={um.id} value={um.id}>
                {um.name} ({um.abbreviation})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category_id">Categoría (Opcional)</Label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id || ''}
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Ninguna...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="brand_id">Marca (Opcional)</Label>
          <select
            id="brand_id"
            name="brand_id"
            defaultValue={product?.brand_id || ''}
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Ninguna...</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description || ''}
          placeholder="Detalles sobre las características, usos o precauciones del producto..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="purchase_price">Precio de Compra</Label>
          <Input
            id="purchase_price"
            name="purchase_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.purchase_price || 0}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sale_price">Precio de Venta</Label>
          <Input
            id="sale_price"
            name="sale_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.sale_price || 0}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="min_stock">Stock Mínimo</Label>
          <Input
            id="min_stock"
            name="min_stock"
            type="number"
            min="0"
            defaultValue={product?.min_stock || 0}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="max_stock">Stock Máximo</Label>
          <Input
            id="max_stock"
            name="max_stock"
            type="number"
            min="0"
            defaultValue={product?.max_stock || 0}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/products')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gradient-primary text-white border-0"
        >
          {product ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
}
