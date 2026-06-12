import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { PencilSquare } from "@medusajs/icons"
import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Button,
  Container,
  Drawer,
  Select,
  StatusBadge,
  Text,
  toast,
} from "@medusajs/ui"

import {
  useAssignableProducerOptions,
  useAssignProductProducer,
  useProductProducer,
} from "./hooks/use-product-producer"

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

type ProductProducerWidgetProps = {
  data: {
    id: string
  }
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong while loading producer details"
}

export default function ProductProducerWidget({
  data,
}: ProductProducerWidgetProps) {
  const [open, setOpen] = useState(false)
  const [selectedProducerId, setSelectedProducerId] = useState<string>("")
  const displayQuery = useProductProducer(data.id)
  const optionsQuery = useAssignableProducerOptions(open)
  const assignMutation = useAssignProductProducer(data.id)

  const currentProducer = displayQuery.data?.producer ?? null

  useEffect(() => {
    setSelectedProducerId(currentProducer?.id ?? "")
  }, [currentProducer?.id])

  const hasSelectionChanged = useMemo(
    () => selectedProducerId !== (currentProducer?.id ?? ""),
    [currentProducer?.id, selectedProducerId]
  )

  const handleSave = async () => {
    try {
      await assignMutation.mutateAsync(selectedProducerId || null)
      toast.success("Producer assignment updated")
      setOpen(false)
    } catch {}
  }

  const handleClear = async () => {
    try {
      await assignMutation.mutateAsync(null)
      toast.success("Producer assignment cleared")
      setOpen(false)
    } catch {}
  }

  return (
    <>
      <Container className="px-0 py-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Text size="small" leading="compact" weight="plus">
              Producer
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Control the manufacturer shown on the product page and producer
              storefront routes.
            </Text>
          </div>
          <Button
            onClick={() => setOpen(true)}
            size="small"
            variant="secondary"
          >
            <PencilSquare />
            Edit
          </Button>
        </div>

        <div className="border-t border-ui-border-base px-6 py-4">
          {displayQuery.isError ? (
            <Alert variant="error">
              <Text>{getErrorMessage(displayQuery.error)}</Text>
            </Alert>
          ) : displayQuery.isLoading ? (
            <Text className="text-ui-fg-subtle">Loading producer...</Text>
          ) : currentProducer ? (
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-2">
                <Text weight="plus">{currentProducer.name}</Text>
                {!currentProducer.is_active && (
                  <StatusBadge color="grey">Inactive</StatusBadge>
                )}
              </div>
              <Text className="text-ui-fg-subtle">{currentProducer.country}</Text>
              <a
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                href={currentProducer.website}
                rel="noreferrer"
                target="_blank"
              >
                {currentProducer.website}
              </a>
            </div>
          ) : (
            <Text className="text-ui-fg-subtle">
              No producer is currently assigned to this product.
            </Text>
          )}
        </div>
      </Container>

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Assign producer</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-6 overflow-auto p-6">
            {assignMutation.isError && (
              <Alert variant="error">
                <Text>{getErrorMessage(assignMutation.error)}</Text>
              </Alert>
            )}
            {optionsQuery.isError ? (
              <Alert variant="error">
                <Text>{getErrorMessage(optionsQuery.error)}</Text>
              </Alert>
            ) : (
              <div className="flex flex-col gap-y-3">
                <Text size="small" leading="compact" weight="plus">
                  Active producers
                </Text>
                <Select
                  onValueChange={setSelectedProducerId}
                  value={selectedProducerId}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select a producer" />
                  </Select.Trigger>
                  <Select.Content>
                    {optionsQuery.data?.map((producer) => (
                      <Select.Item key={producer.id} value={producer.id}>
                        {producer.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Text className="text-ui-fg-subtle" size="small">
                  Inactive producers remain visible if already assigned, but
                  they are excluded from new selection options.
                </Text>
              </div>
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex items-center justify-between gap-x-2">
              <Button
                disabled={!currentProducer || assignMutation.isPending}
                isLoading={assignMutation.isPending}
                onClick={handleClear}
                size="small"
                variant="secondary"
              >
                Clear
              </Button>
              <div className="flex items-center gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button
                  disabled={!hasSelectionChanged || optionsQuery.isLoading}
                  isLoading={assignMutation.isPending}
                  onClick={handleSave}
                  size="small"
                >
                  Save assignment
                </Button>
              </div>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  )
}
