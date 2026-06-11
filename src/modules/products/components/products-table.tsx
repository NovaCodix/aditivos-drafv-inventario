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
import { Search, ArrowUpDown, Eye, Pencil, Package, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
        <div className="flex flex-col items-center justify-center gap-1.5">
          <Switch checked={row.original.is_active} id={`status-${row.original.id}`} />
          <span className={cn(
            "text-[10px] font-bold tracking-wider uppercase",
            row.original.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          )}>
            {row.original.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" asChild>
            <a href={`/products/${row.original.id}/edit`}>
              <Pencil className="w-4 h-4" />
            </a>
          </Button>
        </div>
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
    <Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden !p-0 gap-0 border-0 shadow-none">
      <CardHeader className="pb-4 pt-5 border-b border-border/20">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              id="products-search"
              placeholder="Buscar por nombre, SKU o código..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 h-10 w-full text-xs rounded-xl bg-background/50 border-border/60 focus:bg-background focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Category filter */}
          <div className="flex-1">
            <Select>
              <SelectTrigger className="h-10 w-full text-xs rounded-xl bg-background/50 border-border/60" id="products-category-filter">
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
          </div>

          {/* Brand filter */}
          <div className="flex-1">
            <Select>
              <SelectTrigger className="h-10 w-full text-xs rounded-xl bg-background/50 border-border/60" id="products-brand-filter">
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
          </div>

          <div className="text-xs font-bold text-muted-foreground/75 flex items-center whitespace-nowrap uppercase tracking-wider ml-auto">
            {totalCount} producto{totalCount !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F4F7FB] dark:bg-slate-800/50">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/30">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300 py-3.5">
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
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#F4F7FB] dark:bg-slate-800/50 border-t border-border/30 gap-4 sm:gap-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                Filas por página:
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px] bg-white dark:bg-slate-900 border-border/50 text-[13px] font-medium focus:ring-1 focus:ring-primary/30">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top" alignItemWithTrigger={false} className="animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={`${size}`} className="text-[13px] cursor-pointer">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              Mostrando <span className="font-bold text-slate-700 dark:text-slate-200">{totalCount === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, totalCount)}</span> de <span className="font-bold text-slate-700 dark:text-slate-200">{totalCount}</span> registros
            </p>
          </div>
          <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1 mx-2">
                {[...Array(Math.max(1, table.getPageCount()))].map((_, i) => {
                  // Only show current, first, last, and neighbors
                  const isCurrent = i === table.getState().pagination.pageIndex;
                  const isFirst = i === 0;
                  const isLast = i === Math.max(1, table.getPageCount()) - 1;
                  const isNeighbor = Math.abs(i - table.getState().pagination.pageIndex) <= 1;
                  
                  if (isCurrent || isFirst || isLast || isNeighbor) {
                    return (
                      <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        onClick={() => table.setPageIndex(i)}
                        className={cn(
                          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 min-w-8 text-[13px] px-3",
                          isCurrent 
                            ? "bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90 hover:text-white" 
                            : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                        )}
                      >
                        {i + 1}
                      </Button>
                    );
                  }
                  
                  // Show ellipsis for gaps
                  if (
                    (i === 1 && table.getState().pagination.pageIndex > 2) ||
                    (i === Math.max(1, table.getPageCount()) - 2 && table.getState().pagination.pageIndex < Math.max(1, table.getPageCount()) - 3)
                  ) {
                    return <span key={i} className="text-slate-500 mx-1">...</span>;
                  }
                  
                  return null;
                })}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
      </CardContent>
    </Card>
  )
}
