import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"

import {
  type AdminProducer,
  type ProducerFormData,
  useDeleteProducer,
  useUpdateProducer,
} from "../../../hooks/use-producers"

type EditProducerDrawerProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  producer: AdminProducer | null
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong while saving the producer"
}

export default function EditProducerDrawer({
  open,
  onOpenChange,
  producer,
}: EditProducerDrawerProps) {
  const initialState = useMemo<ProducerFormData>(
    () => ({
      name: producer?.name ?? "",
      country: producer?.country ?? "",
      website: producer?.website ?? "",
      description: producer?.description ?? "",
      is_active: producer?.is_active ?? true,
    }),
    [producer]
  )
  const [form, setForm] = useState<ProducerFormData>(initialState)

  useEffect(() => {
    setForm(initialState)
  }, [initialState])

  const updateProducer = useUpdateProducer(producer?.id ?? "")
  const deleteProducer = useDeleteProducer(producer?.id ?? "")

  const handleSubmit = async () => {
    if (!producer) {
      return
    }

    try {
      await updateProducer.mutateAsync(form)
      toast.success("Producer updated")
      onOpenChange(false)
    } catch {}
  }

  const handleDelete = async () => {
    if (!producer) {
      return
    }

    const confirmed = window.confirm(
      `Delete producer "${producer.name}"? This only succeeds when no products are still linked.`
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteProducer.mutateAsync()
      toast.success("Producer deleted")
      onOpenChange(false)
    } catch {}
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit producer</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-1 flex-col gap-y-6 overflow-auto p-6">
          {producer ? (
            <>
              <div className="rounded-lg border border-ui-border-base px-4 py-3">
                <Text size="small" leading="compact" weight="plus">
                  Handle
                </Text>
                <Text className="text-ui-fg-subtle">{producer.handle}</Text>
                <Text className="mt-2 text-ui-fg-subtle" size="small">
                  The handle stays stable after creation and is used by the
                  storefront producer route.
                </Text>
              </div>
              {(updateProducer.isError || deleteProducer.isError) && (
                <Alert variant="error">
                  <Text>
                    {getErrorMessage(
                      updateProducer.error ?? deleteProducer.error
                    )}
                  </Text>
                </Alert>
              )}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="edit-producer-name">Name</Label>
                  <Input
                    id="edit-producer-name"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    value={form.name}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="edit-producer-country">Country</Label>
                  <Input
                    id="edit-producer-country"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        country: event.target.value,
                      }))
                    }
                    value={form.country}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="edit-producer-website">Website</Label>
                  <Input
                    id="edit-producer-website"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        website: event.target.value,
                      }))
                    }
                    type="url"
                    value={form.website}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="edit-producer-description">Description</Label>
                  <Textarea
                    id="edit-producer-description"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={6}
                    value={form.description ?? ""}
                  />
                </div>
                <label className="flex items-center gap-x-3">
                  <Checkbox
                    checked={Boolean(form.is_active)}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        is_active: checked === true,
                      }))
                    }
                  />
                  <Text>Active</Text>
                </label>
              </div>
            </>
          ) : (
            <Text className="text-ui-fg-subtle">
              Select a producer to edit.
            </Text>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex items-center justify-between gap-x-2">
            <Button
              disabled={!producer || deleteProducer.isPending}
              isLoading={deleteProducer.isPending}
              onClick={handleDelete}
              size="small"
              variant="secondary"
            >
              Delete
            </Button>
            <div className="flex items-center gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                disabled={!producer}
                isLoading={updateProducer.isPending}
                onClick={handleSubmit}
                size="small"
              >
                Save changes
              </Button>
            </div>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
