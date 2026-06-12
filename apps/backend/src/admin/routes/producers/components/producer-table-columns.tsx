import { createDataTableColumnHelper, StatusBadge, Text } from "@medusajs/ui"
import { PencilSquare, Trash } from "@medusajs/icons"

import type { AdminProducer } from "../../../hooks/use-producers"

const columnHelper = createDataTableColumnHelper<AdminProducer>()

type ProducerTableColumnActions = {
  onDelete: (producer: AdminProducer) => void
  onEdit: (producer: AdminProducer) => void
}

export const createProducerColumns = ({
  onDelete,
  onEdit,
}: ProducerTableColumnActions) => {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ getValue }) => (
        <Text size="small" leading="compact" weight="plus">
          {getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("country", {
      header: "Country",
    }),
    columnHelper.accessor("website", {
      header: "Website",
      cell: ({ getValue }) => {
        const value = getValue()

        return (
          <a
            className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            href={value}
            rel="noreferrer"
            target="_blank"
          >
            {value}
          </a>
        )
      },
    }),
    columnHelper.accessor("is_active", {
      header: "Status",
      cell: ({ getValue }) => (
        <StatusBadge color={getValue() ? "green" : "grey"}>
          {getValue() ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    }),
    columnHelper.accessor("product_count", {
      header: "Products",
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const producer = row.original

        return (
          <div className="flex items-center justify-end gap-x-2">
            <button
              className="text-ui-fg-subtle hover:text-ui-fg-base"
              onClick={() => onEdit(producer)}
              type="button"
            >
              <PencilSquare />
            </button>
            <button
              className="text-ui-fg-subtle hover:text-ui-fg-base"
              onClick={() => onDelete(producer)}
              type="button"
            >
              <Trash />
            </button>
          </div>
        )
      },
    }),
  ]
}
