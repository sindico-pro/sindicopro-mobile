import { useState } from 'react'

import type { PhotoKind } from './api/tasks-api'
import { useTaskActions } from './use-task-actions'
import { pickTaskPhoto } from './upload-task-photo'
import { errorMessage } from '@/lib/graphql/errors'

export type PhotoJob = {
  id: string
  kind: PhotoKind
  localUri: string
  progress: number
  status: 'uploading' | 'failed'
  message?: string
}

export function photoPickMessage(source: 'camera' | 'library', error: unknown) {
  const message = errorMessage(error)
  if (source === 'camera' && !message.includes('Permita o uso da câmera')) {
    return 'Câmera indisponível. Escolha da galeria.'
  }
  return message
}

export function usePhotoUpload(condoId: string | null, taskId: string | null) {
  const actions = useTaskActions(condoId)
  const [jobs, setJobs] = useState<PhotoJob[]>([])

  function update(id: string, patch: Partial<PhotoJob>) {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, ...patch } : job)))
  }

  async function send(kind: PhotoKind, uri: string, existingId?: string) {
    if (!taskId) return
    const id = existingId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setJobs((current) => [
      ...current.filter((job) => job.id !== id),
      { id, kind, localUri: uri, progress: 0, status: 'uploading' },
    ])
    try {
      await actions.attachPhoto({
        id: taskId,
        kind,
        uri,
        onProgress: (ratio) => update(id, { progress: ratio }),
      })
      setJobs((current) => current.filter((job) => job.id !== id))
    } catch (error) {
      update(id, { status: 'failed', message: errorMessage(error) })
    }
  }

  async function pick(kind: PhotoKind, source: 'camera' | 'library') {
    try {
      const photo = await pickTaskPhoto(source)
      if (!photo) return null
      await send(kind, photo.uri)
      return null
    } catch (error) {
      return photoPickMessage(source, error)
    }
  }

  function retry(job: PhotoJob) {
    return send(job.kind, job.localUri, job.id)
  }

  return { jobs, pick, retry }
}
