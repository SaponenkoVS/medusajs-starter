import { useMemo, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Alert,
  Button,
  Container,
  DataTable,
  Heading,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { BuildingStorefront, Plus } from "@medusajs/icons"

import {
  type AdminProducer,
  useAdminProducerList,
} from "../../hooks/use-producers"
import CreateProducerModal from "./components/create-producer-modal"
import { createProducerColumns } from "./components/producer-table-columns"
import EditProducerDrawer from "./components/edit-producer-drawer"
import { useProducerTable } from "./hooks/use-producer-table"

export const config = defineRouteConfig({
  label: "Producers",
  icon: BuildingStorefront,
})

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "We couldn't load producers right now"
}

export default function ProducersPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<AdminProducer | null>(
    null
  )
  const [editOpen, setEditOpen] = useState(false)
  const {
    limit,
    offset,
    pagination,
    searchValue,
    setPagination,
    setSearchValue,
  } = useProducerTable()
  const listQuery = useAdminProducerList({
    limit,
    offset,
    q: searchValue || undefined,
  })

  const columns = useMemo(
    () =>
      createProducerColumns({
        onEdit: (producer) => {
          setEditingProducer(producer)
          setEditOpen(true)
        },
        onDelete: (producer) => {
          setEditingProducer(producer)
          setEditOpen(true)
        },
      }),
    []
  )

  const table = useDataTable({
    columns,
    data: listQuery.data?.producers ?? [],
    getRowId: (producer) => producer.id,
    isLoading: listQuery.isLoading,
    rowCount: listQuery.data?.count ?? 0,
    search: {
      state: searchValue,
      onSearchChange: setSearchValue,
    },
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <>
      <Container className="divide-y divide-ui-border-base px-0 py-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Producers</Heading>
            <Text className="text-ui-fg-subtle">
              Manage the manufacturers that can be assigned to products and
              shown in the storefront.
            </Text>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="small">
            <Plus />
            Add producer
          </Button>
        </div>

        {listQuery.isError ? (
          <div className="px-6 py-6">
            <Alert variant="error">
              <Text>{getErrorMessage(listQuery.error)}</Text>
            </Alert>
          </div>
        ) : listQuery.isLoading ? (
          <div className="px-6 py-10">
            <Text className="text-ui-fg-subtle">Loading producers...</Text>
          </div>
        ) : (listQuery.data?.producers.length ?? 0) === 0 ? (
          <div className="px-6 py-10">
            <Text weight="plus">No producers found</Text>
            <Text className="mt-2 text-ui-fg-subtle">
              Create the first producer to make it available for product
              assignment and storefront discovery.
            </Text>
          </div>
        ) : (
          <DataTable instance={table}>
            <DataTable.Toolbar>
              <div className="flex w-full items-center justify-between gap-x-3">
                <DataTable.Search placeholder="Search producers" />
              </div>
            </DataTable.Toolbar>
            <DataTable.Table />
            <DataTable.Pagination />
          </DataTable>
        )}
      </Container>

      <CreateProducerModal open={createOpen} onOpenChange={setCreateOpen} />
      <EditProducerDrawer
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setEditingProducer(null)
          }
        }}
        open={editOpen}
        producer={editingProducer}
      />
    </>
  )
}
