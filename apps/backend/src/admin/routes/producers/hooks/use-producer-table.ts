import { useState } from "react"
import { DataTablePaginationState } from "@medusajs/ui"

export const DEFAULT_PAGE_SIZE = 15

export const useProducerTable = () => {
  const [searchValue, setSearchValue] = useState("")
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const limit = pagination.pageSize
  const offset = pagination.pageIndex * pagination.pageSize

  return {
    limit,
    offset,
    pagination,
    searchValue,
    setPagination,
    setSearchValue,
  }
}
