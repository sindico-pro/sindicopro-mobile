import { useQuery } from '@tanstack/react-query'

import { realizationsApi } from './api/realizations-api'

export function useRealizations(personId: string | null, condoId: string | null) {
  return useQuery({
    queryKey: ['realizations', personId, condoId],
    enabled: Boolean(personId && condoId),
    queryFn: () => realizationsApi.list(condoId as string),
  })
}
