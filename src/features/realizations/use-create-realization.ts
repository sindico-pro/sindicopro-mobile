import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useSession } from '@/features/auth/session/session-provider'
import { getRealizationsBucket } from '@/lib/env'
import { AppError } from '@/lib/graphql/errors'
import { uploadPhotos } from '@/lib/upload-photo'

import { realizationsApi } from './api/realizations-api'

export function useCreateRealization(condoId: string | null) {
  const queryClient = useQueryClient()
  const { user } = useSession()
  const personId = user?.id ?? null
  const [busy, setBusy] = useState(false)

  async function create(input: {
    title: string
    description: string
    heldIn: string
    photoUris: string[]
    beforePhotoUris?: string[]
  }) {
    if (!personId || !condoId) throw new AppError('bad_request', 'Escolha um condomínio.')
    setBusy(true)
    try {
      const bucket = getRealizationsBucket()
      const photoUrls = await uploadPhotos({
        userId: personId,
        condoId,
        uris: input.photoUris,
        bucket,
        folderPath: 'realizations',
      })
      const beforePhotoUrls = input.beforePhotoUris?.length
        ? await uploadPhotos({
            userId: personId,
            condoId,
            uris: input.beforePhotoUris,
            bucket,
            folderPath: 'realizations',
          })
        : []
      const created = await realizationsApi.create({
        condoId,
        title: input.title,
        description: input.description,
        heldIn: input.heldIn,
        photoUrls,
        beforePhotoUrls,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['realizations'] }),
        queryClient.invalidateQueries({ queryKey: ['home'] }),
        queryClient.invalidateQueries({ queryKey: ['realization', personId, created.id] }),
      ])
      return created
    } finally {
      setBusy(false)
    }
  }

  return { create, busy }
}
