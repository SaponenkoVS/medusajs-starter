import { useEffect, useState } from "react"
import {
  Alert,
  Button,
  Checkbox,
  FocusModal,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"

import {
  type ProducerFormData,
  useCreateProducer,
} from "../../../hooks/use-producers"

type CreateProducerModalProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
}

const EMPTY_FORM: ProducerFormData = {
  name: "",
  country: "",
  website: "",
  description: "",
  is_active: true,
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong while saving the producer"
}

export default function CreateProducerModal({
  open,
  onOpenChange,
}: CreateProducerModalProps) {
  const [form, setForm] = useState<ProducerFormData>(EMPTY_FORM)
  const createProducer = useCreateProducer()

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
    }
  }, [open])

  const handleSubmit = async () => {
    try {
      await createProducer.mutateAsync(form)
      toast.success("Producer created")
      onOpenChange(false)
    } catch {}
  }

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <div className="flex h-full flex-col overflow-hidden">
          <FocusModal.Header>
            <div className="flex items-center justify-end gap-x-2">
              <FocusModal.Close asChild>
                <Button size="small" variant="secondary">
                  Cancel
                </Button>
              </FocusModal.Close>
              <Button
                isLoading={createProducer.isPending}
                onClick={handleSubmit}
                size="small"
              >
                Save producer
              </Button>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="flex-1 overflow-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-y-6 px-6 py-6">
              <div>
                <Text weight="plus">Create producer</Text>
                <Text className="text-ui-fg-subtle">
                  Add the producer details used in admin assignment and the
                  storefront producer pages.
                </Text>
              </div>
              {createProducer.isError && (
                <Alert variant="error">
                  <Text>{getErrorMessage(createProducer.error)}</Text>
                </Alert>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="producer-name">Name</Label>
                  <Input
                    id="producer-name"
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
                  <Label htmlFor="producer-country">Country</Label>
                  <Input
                    id="producer-country"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        country: event.target.value,
                      }))
                    }
                    value={form.country}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="producer-website">Website</Label>
                <Input
                  id="producer-website"
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
                <Label htmlFor="producer-description">Description</Label>
                <Textarea
                  id="producer-description"
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
                <div>
                  <Text weight="plus">Active</Text>
                  <Text className="text-ui-fg-subtle">
                    Inactive producers stay visible on already-linked products
                    but are not assignable to new products.
                  </Text>
                </div>
              </label>
            </div>
          </FocusModal.Body>
        </div>
      </FocusModal.Content>
    </FocusModal>
  )
}
