import { useQuery } from '@tanstack/react-query'

import { occurrencesApi, type OccurrenceFilter } from './api/occurrences-api'

export function useOccurrences(personId: string | null, condoId: string | null, filter: OccurrenceFilter) {
  return useQuery({
    queryKey: ['occurrences', personId, condoId, filter],
    enabled: Boolean(personId && condoId),
    queryFn: () => occurrencesApi.list(condoId as string, filter),
  })
}
