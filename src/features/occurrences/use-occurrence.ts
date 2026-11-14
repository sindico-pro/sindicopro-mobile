import { useQuery } from '@tanstack/react-query'

import { occurrencesApi } from './api/occurrences-api'

export function useOccurrence(personId: string | null, id: string | null) {
  return useQuery({
    queryKey: ['occurrence', personId, id],
    enabled: Boolean(personId && id),
    queryFn: () => occurrencesApi.detail(id as string),
  })
}

export function useOccurrenceAccess(personId: string | null, condoId: string | null) {
  return useQuery({
    queryKey: ['occurrence-access', personId, condoId],
    enabled: Boolean(personId && condoId),
    queryFn: () => occurrencesApi.access(condoId as string),
  })
}
