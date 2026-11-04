import { useQuery } from '@tanstack/react-query'

import { tasksApi } from './api/tasks-api'
import type { TaskDue, TaskStatus } from './due-phrase'

export function useTaskCounts(personId: string | null, condoId: string | null) {
  return useQuery({
    queryKey: ['task-counts', personId, condoId],
    enabled: Boolean(personId && condoId),
    queryFn: () => tasksApi.counts(condoId as string),
  })
}

export function useTaskList(
  personId: string | null,
  condoId: string | null,
  status: TaskStatus,
  due: TaskDue | null,
  mine: boolean,
  limit: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ['task-list', personId, condoId, status, due, mine, limit],
    enabled: Boolean(personId && condoId && enabled),
    queryFn: () => tasksApi.list(condoId as string, status, due, mine, limit),
  })
}
