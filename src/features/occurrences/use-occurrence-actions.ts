import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useSession } from '@/features/auth/session/session-provider'
import { getKanbanBucket } from '@/lib/env'
import { AppError } from '@/lib/graphql/errors'
import { uploadPhotos } from '@/lib/upload-photo'

import { occurrencesApi } from './api/occurrences-api'

export function useOccurrenceActions(condoId: string | null) {
  const queryClient = useQueryClient()
  const { user } = useSession()
  const personId = user?.id ?? null
  const [busy, setBusy] = useState(false)

  async function refresh(id?: string) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['occurrences'] }),
      queryClient.invalidateQueries({ queryKey: ['home'] }),
      queryClient.invalidateQueries({ queryKey: ['occurrence-access'] }),
      id && personId
        ? queryClient.invalidateQueries({ queryKey: ['occurrence', personId, id] })
        : Promise.resolve(),
    ])
  }

  function requireScope() {
    if (!personId || !condoId) throw new AppError('bad_request', 'Escolha um condomínio.')
    return { personId, condoId }
  }

  const respond = useMutation({
    mutationFn: async (input: { id: string; content: string; photoUris?: string[] }) => {
      const scope = requireScope()
      const fileUrls = input.photoUris?.length
        ? await uploadPhotos({
            userId: scope.personId,
            condoId: scope.condoId,
            uris: input.photoUris,
            bucket: getKanbanBucket(),
            folderPath: 'occurrences',
          })
        : undefined
      await occurrencesApi.respond(input.id, input.content, fileUrls)
      await refresh(input.id)
    },
  })

  const close = useMutation({
    mutationFn: async (id: string) => {
      requireScope()
      await occurrencesApi.close(id)
      await refresh(id)
    },
  })

  async function create(input: {
    title: string
    description: string
    occurredAt: string
    photoUris?: string[]
  }) {
    const scope = requireScope()
    setBusy(true)
    try {
      const fileUrls = input.photoUris?.length
        ? await uploadPhotos({
            userId: scope.personId,
            condoId: scope.condoId,
            uris: input.photoUris,
            bucket: getKanbanBucket(),
            folderPath: 'occurrences',
          })
        : undefined
      const created = await occurrencesApi.create({
        condoId: scope.condoId,
        title: input.title,
        description: input.description,
        occurredAt: input.occurredAt,
        fileUrls,
      })
      await refresh(created.id)
      return created
    } finally {
      setBusy(false)
    }
  }

  return { respond, close, create, busy }
}
