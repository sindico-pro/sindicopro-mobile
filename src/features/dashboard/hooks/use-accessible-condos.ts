import { useQuery } from '@tanstack/react-query'

import type { SessionUser } from '@/features/auth/api/schemas'
import { canSeeCondos } from '@/features/auth/access-policy'
import {
  FetchCondosPersonHasAccessDocument,
  GetCondosByPersonDocument,
} from '@/features/dashboard/api/operations'
import { executeGraphql } from '@/lib/graphql/client'
import { AppError } from '@/lib/graphql/errors'

export type CondoSummary = {
  id: string
  name: string
  phone: string
  document: string
  status: string
}

export function useAccessibleCondos(user: SessionUser | null) {
  const enabled = user != null && canSeeCondos(user)

  return useQuery({
    queryKey: ['condos', user?.id ?? 'anonymous', user?.isEmployee ?? false],
    enabled,
    queryFn: async ({ signal }): Promise<CondoSummary[]> => {
      if (!user) {
        throw new AppError('invalid_response', 'Sessão indisponível.')
      }
      if (user.isEmployee) {
        if (!user.createdByPersonId) {
          throw new AppError(
            'invalid_response',
            'Não foi possível identificar o síndico desta equipe.',
          )
        }
        const data = await executeGraphql(
          FetchCondosPersonHasAccessDocument,
          {
            person_id: user.id,
            created_by_person_id: user.createdByPersonId,
          },
          { signal },
        )
        return data.fetchCondosPersonHasAccess
      }

      const data = await executeGraphql(
        GetCondosByPersonDocument,
        { person_id: user.id },
        { signal },
      )
      return data.getCondosByPerson
    },
  })
}
