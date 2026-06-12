import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { sdk } from "../lib/sdk"

export type ProducerFormData = {
  name: string
  country: string
  website: string
  description?: string | null
  is_active?: boolean
}

export type AdminProducer = {
  id: string
  name: string
  handle: string
  country: string
  website: string
  description: string | null
  is_active: boolean
  product_count: number
}

type AdminProducerListResponse = {
  producers: AdminProducer[]
  count: number
  limit: number
  offset: number
}

type AdminProducerDetailResponse = {
  producer: AdminProducer
}

type AdminProducerMutationResponse = {
  producer: Omit<AdminProducer, "product_count"> & {
    product_count?: number
  }
}

export const producerQueryKeys = {
  all: ["producers"] as const,
  list: (params: Record<string, unknown>) =>
    [...producerQueryKeys.all, "list", params] as const,
  detail: (id: string) => [...producerQueryKeys.all, "detail", id] as const,
  options: () => [...producerQueryKeys.all, "options"] as const,
}

export const useAdminProducerList = (params: {
  limit: number
  offset: number
  q?: string
}) => {
  return useQuery({
    queryKey: producerQueryKeys.list(params),
    queryFn: () =>
      sdk.client.fetch<AdminProducerListResponse>("/admin/producers", {
        method: "GET",
        query: params,
      }),
  })
}

export const useAdminProducer = (id?: string | null) => {
  return useQuery({
    queryKey: producerQueryKeys.detail(id ?? "missing"),
    queryFn: () =>
      sdk.client.fetch<AdminProducerDetailResponse>(`/admin/producers/${id}`, {
        method: "GET",
      }),
    enabled: Boolean(id),
  })
}

export const useProducerOptions = (enabled = true) => {
  return useQuery({
    queryKey: producerQueryKeys.options(),
    queryFn: async () => {
      const response = await sdk.client.fetch<AdminProducerListResponse>(
        "/admin/producers",
        {
          method: "GET",
          query: {
            limit: 100,
            offset: 0,
            is_active: true,
          },
        }
      )

      return response.producers
    },
    enabled,
  })
}

export const useCreateProducer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ProducerFormData) =>
      sdk.client.fetch<AdminProducerMutationResponse>("/admin/producers", {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: producerQueryKeys.all })
    },
  })
}

export const useUpdateProducer = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ProducerFormData) =>
      sdk.client.fetch<AdminProducerMutationResponse>(`/admin/producers/${id}`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: producerQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: producerQueryKeys.detail(id) })
    },
  })
}

export const useDeleteProducer = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ id: string; object: "producer"; deleted: boolean }>(
        `/admin/producers/${id}`,
        {
          method: "DELETE",
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: producerQueryKeys.all })
      queryClient.removeQueries({ queryKey: producerQueryKeys.detail(id) })
    },
  })
}
