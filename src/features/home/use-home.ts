import { useQuery } from '@tanstack/react-query'

import { homeApi } from './api/home-api'

export function useHome(personId: string | null, condoId: string | null) {
  return useQuery({
    queryKey: ['home', personId, condoId],
    enabled: Boolean(personId && condoId),
    queryFn: () => homeApi.load(condoId as string),
  })
}
