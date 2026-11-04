import { z } from 'zod'

import {
  MobileAddTaskCommentDocument,
  MobileAddTaskPhotosDocument,
  MobileCreateTaskDocument,
  MobileMoveTaskDocument,
  MobileRemoveTaskPhotoDocument,
  MobileTaskCountsDocument,
  MobileTaskDocument,
  MobileTaskFormOptionsDocument,
  MobileTaskListDocument,
} from './operations'
import { taskStatuses, type TaskDue, type TaskStatus } from '../due-phrase'
import { executeGraphql } from '@/lib/graphql/client'
import { AppError } from '@/lib/graphql/errors'

const statusSchema = z.enum(taskStatuses)
const dateSchema = z.string().nullable()

const countsSchema = z.object({
  todo: z.number().int(),
  doing: z.number().int(),
  done: z.number().int(),
  overdue: z.number().int(),
  canCreate: z.boolean(),
  canExecute: z.boolean(),
  mineLocked: z.boolean(),
})

const listItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.string(),
  dueDate: dateSchema,
  isOverdue: z.boolean(),
  responsibleName: z.string().nullable(),
  status: statusSchema,
  photoCount: z.number().int(),
  commentCount: z.number().int(),
})

const commentSchema = z.object({
  id: z.string(),
  content: z.string(),
  authorName: z.string(),
  createdAt: z.string(),
})

const detailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.string(),
  dueDate: dateSchema,
  isOverdue: z.boolean(),
  status: statusSchema,
  responsibleId: z.string().nullable(),
  responsibleName: z.string().nullable(),
  beforePhotoUrls: z.array(z.string()),
  afterPhotoUrls: z.array(z.string()),
  comments: z.array(commentSchema),
  startedByName: z.string().nullable(),
  startedAt: dateSchema,
  completedByName: z.string().nullable(),
  completedAt: dateSchema,
  occurrenceId: z.string().nullable(),
  occurrenceTitle: z.string().nullable(),
  canExecute: z.boolean(),
  canEdit: z.boolean(),
  canCreate: z.boolean(),
})

const formOptionsSchema = z.object({
  canCreate: z.boolean(),
  responsibles: z.array(z.object({ id: z.string(), name: z.string() })),
  categories: z.array(z.object({ id: z.string(), name: z.string() })),
})

export type TaskCounts = z.infer<typeof countsSchema>
export type TaskListItem = z.infer<typeof listItemSchema>
export type TaskDetail = z.infer<typeof detailSchema>
export type TaskFormOptions = z.infer<typeof formOptionsSchema>
export type PhotoKind = 'BEFORE' | 'AFTER'

function parsed<T>(result: z.SafeParseReturnType<unknown, T>) {
  if (!result.success) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
  return result.data
}

export type CreateTaskInput = {
  condoId: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string | null
  responsibleId?: string
  photoUrls?: string[]
}

export const tasksApi = {
  async counts(condoId: string) {
    const data = await executeGraphql(MobileTaskCountsDocument, { condoId })
    return parsed(countsSchema.safeParse(data.mobileTaskCounts))
  },
  async list(condoId: string, status: TaskStatus, due: TaskDue | null, mine: boolean, limit: number) {
    const data = await executeGraphql(MobileTaskListDocument, {
      condoId,
      status,
      due,
      mine,
      limit,
      offset: 0,
    })
    return parsed(z.array(listItemSchema).safeParse(data.mobileTaskList))
  },
  async detail(id: string) {
    const data = await executeGraphql(MobileTaskDocument, { id })
    return parsed(detailSchema.safeParse(data.mobileTask))
  },
  async formOptions(condoId: string) {
    const data = await executeGraphql(MobileTaskFormOptionsDocument, { condoId })
    return parsed(formOptionsSchema.safeParse(data.mobileTaskFormOptions))
  },
  async move(id: string, status: TaskStatus) {
    await executeGraphql(MobileMoveTaskDocument, { id, status })
  },
  async comment(id: string, content: string) {
    await executeGraphql(MobileAddTaskCommentDocument, { id, content })
  },
  async addPhotos(id: string, kind: PhotoKind, urls: string[]) {
    await executeGraphql(MobileAddTaskPhotosDocument, { id, kind, urls })
  },
  async removePhoto(id: string, url: string) {
    await executeGraphql(MobileRemoveTaskPhotoDocument, { id, url })
  },
  async create(input: CreateTaskInput) {
    const data = await executeGraphql(MobileCreateTaskDocument, { data: input })
    const created = parsed(
      z.object({ id: z.string(), title: z.string() }).safeParse(data.mobileCreateTask),
    )
    return created
  },
}
