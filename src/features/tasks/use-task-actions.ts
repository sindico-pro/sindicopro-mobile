import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { tasksApi, type CreateTaskInput, type PhotoKind } from './api/tasks-api'
import type { TaskStatus } from './due-phrase'
import { useSession } from '@/features/auth/session/session-provider'
import { getKanbanBucket } from '@/lib/env'
import { AppError } from '@/lib/graphql/errors'
import { compressPhoto, uploadPhoto } from '@/lib/upload-photo'

export function useTaskActions(condoId: string | null) {
  const queryClient = useQueryClient()
  const { user } = useSession()
  const personId = user?.id ?? null
  const [busy, setBusy] = useState(false)

  async function refresh(taskId?: string) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['task-counts'] }),
      queryClient.invalidateQueries({ queryKey: ['task-list'] }),
      queryClient.invalidateQueries({ queryKey: ['home'] }),
      taskId && personId
        ? queryClient.invalidateQueries({ queryKey: ['task', personId, taskId] })
        : Promise.resolve(),
    ])
  }

  function requireScope() {
    if (!personId || !condoId) throw new AppError('bad_request', 'Escolha um condomínio.')
    return { personId, condoId }
  }

  const move = useMutation({
    mutationFn: async (input: { id: string; status: TaskStatus }) => {
      requireScope()
      await tasksApi.move(input.id, input.status)
      await refresh(input.id)
    },
  })

  const comment = useMutation({
    mutationFn: async (input: { id: string; content: string }) => {
      requireScope()
      await tasksApi.comment(input.id, input.content)
      await refresh(input.id)
    },
  })

  const addPhotos = useMutation({
    mutationFn: async (input: { id: string; kind: PhotoKind; urls: string[] }) => {
      requireScope()
      await tasksApi.addPhotos(input.id, input.kind, input.urls)
      await refresh(input.id)
    },
  })

  const removePhoto = useMutation({
    mutationFn: async (input: { id: string; url: string }) => {
      requireScope()
      await tasksApi.removePhoto(input.id, input.url)
      await refresh(input.id)
    },
  })

  async function sendPhoto(taskId: string, kind: PhotoKind, uri: string, onProgress?: (ratio: number) => void) {
    const scope = requireScope()
    const compressed = await compressPhoto(uri)
    const url = await uploadPhoto({
      userId: scope.personId,
      condoId: scope.condoId,
      uri: compressed,
      bucket: getKanbanBucket(),
      folderPath: 'tasks',
      onProgress,
    })
    await tasksApi.addPhotos(taskId, kind, [url])
  }

  async function attachPhoto(input: { id: string; kind: PhotoKind; uri: string; onProgress?: (ratio: number) => void }) {
    await sendPhoto(input.id, input.kind, input.uri, input.onProgress)
    await refresh(input.id)
  }

  async function start(input: { id: string; photoUri?: string }) {
    setBusy(true)
    try {
      if (input.photoUri) await sendPhoto(input.id, 'BEFORE', input.photoUri)
      await tasksApi.move(input.id, 'IN_PROGRESS')
      await refresh(input.id)
    } finally {
      setBusy(false)
    }
  }

  async function conclude(input: { id: string; comment?: string; photoUri?: string; onProgress?: (ratio: number) => void }) {
    setBusy(true)
    try {
      if (input.photoUri) await sendPhoto(input.id, 'AFTER', input.photoUri, input.onProgress)
      const text = input.comment?.trim()
      if (text) await tasksApi.comment(input.id, text)
      await tasksApi.move(input.id, 'DONE')
      await refresh(input.id)
    } finally {
      setBusy(false)
    }
  }

  async function create(input: Omit<CreateTaskInput, 'condoId' | 'photoUrls'> & { photoUri?: string }) {
    const scope = requireScope()
    setBusy(true)
    try {
      let photoUrls: string[] | undefined
      if (input.photoUri) {
        const compressed = await compressPhoto(input.photoUri)
        const url = await uploadPhoto({
          userId: scope.personId,
          condoId: scope.condoId,
          uri: compressed,
          bucket: getKanbanBucket(),
          folderPath: 'tasks',
        })
        photoUrls = [url]
      }
      const created = await tasksApi.create({
        condoId: scope.condoId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate: input.dueDate,
        responsibleId: input.responsibleId,
        photoUrls,
      })
      await refresh(created.id)
      return created
    } finally {
      setBusy(false)
    }
  }

  return { move, comment, addPhotos, removePhoto, attachPhoto, start, conclude, create, busy }
}
