'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Search, ArrowUpDown, Edit, Trash2, MoreHorizontal, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/shared/lib/utils'
import type { ProductWithRelations } from '@/modules/products/services/products.service'
import type { Category, Brand, UnitMeasure } from '@/shared/types/database.types'
import { cn } from '@/lib/utils'

interface ProductsTableProps {
  products: ProductWithRelations[]
  totalCount: number
  categories: Category[]
  brands: Brand[]
  unitMeasures: UnitMeasure[]
  currentPage: number
}

export function ProductsTable({
  products,
  totalCount,
  categories,
  brands,
  unitMeasures,
  currentPage,
}: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<ProductWithRelations>[] = useMemo(() => [
    {
      accessorKey: 'sku',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 -ml-2 font-bold uppercase tracking-wider text-[10px]"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          SKU
          <ArrowUpDown className="ml-1 w-3 h-3 opacity-60" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 border border-primary/15 px-2.5 py-0.5 rounded-md shadow-sm">
          {row.original.sku}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm text-foreground tracking-tight">{row.original.name}</p>
            {row.original.barcode && (
              <p className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">{row.original.barcode}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ row }) => (
        <span className="font-medium text-foreground/80 text-[13px]">
          {row.original.category?.name || <span className="text-muted-foreground/60 text-xs">—</span>}
        </span>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Marca',
      cell: ({ row }) => (
        <span className="font-medium text-foreground/80 text-[13px]">
          {row.original.brand?.name || <span className="text-muted-foreground/60 text-xs">—</span>}
        </span>
      ),
    },
    {
      accessorKey: 'unit_measure',
      header: 'Unidad',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-bold font-mono tracking-wider bg-muted/40 border-border/60 text-muted-foreground uppercase px-2 py-0.5">
          {row.original.unit_measure?.abbreviation || '—'}
        </Badge>
      ),
    },
    {
      accessorKey: 'purchase_price',
      header: 'P. Compra',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-muted-foreground">{formatCurrency(row.original.purchase_price)}</span>
      ),
    },
    {
      accessorKey: 'sale_price',
      header: 'P. Venta',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-bold text-foreground bg-muted/20 border border-border/30 px-2 py-0.5 rounded-lg shadow-sm">{formatCurrency(row.original.sale_price)}</span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge
          variant={row.original.is_active ? 'default' : 'secondary'}
          className={cn(
            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border shadow-sm",
            row.original.is_active
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
              : 'bg-muted text-muted-foreground border-border/40'
          )}
        >
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-muted/60"
              id={`product-actions-${row.original.id}`}
            />
          }>
              <MoreHorizontal className="w-3.5 h-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-1">
            <DropdownMenuItem render={<a href={`/products/${row.original.id}/edit`} />} className="cursor-pointer">
                <Edit className="w-3.5 h-3.5 mr-2 opacity-70" />
                Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2 opacity-70" />
              Desactivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-4 pt-5 border-b border-border/20">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              id="products-search"
              placeholder="Buscar por nombre, SKU o código..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/60 focus:bg-background focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Category filter */}
          <Select>
            <SelectTrigger className="h-9 w-[160px] text-xs rounded-xl bg-background/50 border-border/60" id="products-category-filter">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs cursor-pointer">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand filter */}
          <Select>
            <SelectTrigger className="h-9 w-[140px] text-xs rounded-xl bg-background/50 border-border/60" id="products-brand-filter">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id} className="text-xs cursor-pointer">
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-xs font-bold text-muted-foreground/75 flex items-center whitespace-nowrap uppercase tracking-wider ml-auto">
            {totalCount} producto{totalCount !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/30">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 py-3.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Package className="w-12 h-12 opacity-15" />
                      <p className="text-sm font-semibold">No se encontraron productos</p>
                      <p className="text-xs opacity-60">Crea tu primer producto usando el botón &ldquo;Nuevo Producto&rdquo;</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/20 transition-all duration-200 border-b border-border/25 last:border-none"
                    id={`product-row-${row.original.id}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-3 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
            <p className="text-xs font-semibold text-muted-foreground/75 uppercase tracking-wider">
              Página {currentPage} de {table.getPageCount()} ({totalCount} resultados)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                id="products-prev-page"
                className="h-8 rounded-lg text-xs"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                id="products-next-page"
                className="h-8 rounded-lg text-xs"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
