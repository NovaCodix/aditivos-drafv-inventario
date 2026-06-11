"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps {
  totalItems: number
  pageSizeOptions?: number[]
  defaultPageSize?: number
}

export function DataTablePagination({
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
}: DataTablePaginationProps) {
  const [pageSize, setPageSize] = React.useState(defaultPageSize)
  const [currentPage, setCurrentPage] = React.useState(1)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1)
  const endItem = Math.min(totalItems, currentPage * pageSize)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#F4F7FB] dark:bg-slate-800/50 border-t border-border/30 gap-4 sm:gap-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
            Filas por página:
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[70px] bg-white dark:bg-slate-900 border-border/50 text-[13px] font-medium focus:ring-1 focus:ring-primary/30">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" alignItemWithTrigger={false} className="animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-[13px] cursor-pointer">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
          Mostrando <span className="font-bold text-slate-700 dark:text-slate-200">{startItem === 0 && totalItems === 0 ? 0 : startItem} - {endItem}</span> de <span className="font-bold text-slate-700 dark:text-slate-200">{totalItems}</span> registros
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 h-8 w-8 text-slate-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1 mx-2">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 min-w-8 text-[13px] px-3 bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 hover:text-white">
            {currentPage}
          </button>
        </div>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 h-8 w-8 text-slate-500"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
