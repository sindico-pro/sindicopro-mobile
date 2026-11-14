import { useQuery } from '@tanstack/react-query'

import { realizationsApi } from './api/realizations-api'

export function useRealization(personId: string | null, id: string | null) {
  return useQuery({
    queryKey: ['realization', personId, id],
    enabled: Boolean(personId && id),
    queryFn: () => realizationsApi.detail(id as string),
  })
}

export function useRealizationAccess(personId: string | null, condoId: string | null) {
  return useQuery({
    queryKey: ['realization-access', personId, condoId],
    enabled: Boolean(personId && condoId),
    queryFn: () => realizationsApi.access(condoId as string),
  })
}
