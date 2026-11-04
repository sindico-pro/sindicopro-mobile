import { useQuery } from '@tanstack/react-query'

import { tasksApi } from './api/tasks-api'

export function useTask(personId: string | null, id: string | null) {
  return useQuery({
    queryKey: ['task', personId, id],
    enabled: Boolean(personId && id),
    queryFn: () => tasksApi.detail(id as string),
  })
}

export function useTaskFormOptions(personId: string | null, condoId: string | null) {
  return useQuery({
    queryKey: ['task-form', personId, condoId],
    enabled: Boolean(personId && condoId),
    queryFn: () => tasksApi.formOptions(condoId as string),
  })
}
