import { z } from 'zod'

import {
  MobileCloseOccurrenceDocument,
  MobileCreateOccurrenceDocument,
  MobileOccurrenceAccessDocument,
  MobileOccurrenceDocument,
  MobileOccurrencesDocument,
  MobileRespondOccurrenceDocument,
} from './operations'
import { executeGraphql } from '@/lib/graphql/client'
import { AppError } from '@/lib/graphql/errors'

export const occurrenceFilters = ['OPEN', 'WITHOUT_RESPONSE', 'PENDING_MANAGER', 'CLOSED'] as const
export type OccurrenceFilter = (typeof occurrenceFilters)[number]

const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  occurredAt: z.string().nullable(),
  createdAt: z.string().nullable(),
})

export type OccurrenceItem = z.infer<typeof itemSchema>

const responseSchema = z.object({
  id: z.string(),
  content: z.string(),
  fromManager: z.boolean(),
  authorName: z.string(),
  fileUrls: z.array(z.string()),
  createdAt: z.string(),
})

const detailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  occurredAt: z.string().nullable(),
  authorName: z.string(),
  fileUrls: z.array(z.string()),
  responses: z.array(responseSchema),
  canRespond: z.boolean(),
  canClose: z.boolean(),
})

const accessSchema = z.object({ canCreate: z.boolean() })

export type OccurrenceDetail = z.infer<typeof detailSchema>
export type OccurrenceResponseItem = z.infer<typeof responseSchema>

function parsed<T>(result: z.SafeParseReturnType<unknown, T>) {
  if (!result.success) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
  return result.data
}

export function occurrenceFilter(value: string | string[] | undefined): OccurrenceFilter {
  const raw = Array.isArray(value) ? value[0] : value
  return occurrenceFilters.find((filter) => filter === raw) ?? 'OPEN'
}

const statusLabel: Record<string, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Encerrada',
  FROZEN: 'Congelada',
}

export function occurrenceSubtitle(item: OccurrenceItem) {
  const when = item.occurredAt ?? item.createdAt
  const date = when ? new Date(when) : null
  const formatted = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date)
    : null
  return [statusLabel[item.status] ?? item.status, formatted].filter(Boolean).join(' · ')
}

export const occurrencesApi = {
  async list(condoId: string, filter: OccurrenceFilter) {
    const data = await executeGraphql(MobileOccurrencesDocument, { condoId, filter })
    const parsed = z.array(itemSchema).safeParse(data.mobileOccurrences)
    if (!parsed.success) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
    return parsed.data
  },
  async detail(id: string) {
    const data = await executeGraphql(MobileOccurrenceDocument, { id })
    return parsed(detailSchema.safeParse(data.mobileOccurrence))
  },
  async access(condoId: string) {
    const data = await executeGraphql(MobileOccurrenceAccessDocument, { condoId })
    return parsed(accessSchema.safeParse(data.mobileOccurrenceAccess))
  },
  async create(input: {
    condoId: string
    title: string
    description: string
    occurredAt: string
    fileUrls?: string[]
  }) {
    const data = await executeGraphql(MobileCreateOccurrenceDocument, { data: input })
    return parsed(z.object({ id: z.string(), title: z.string() }).safeParse(data.mobileCreateOccurrence))
  },
  async respond(id: string, content: string, fileUrls?: string[]) {
    await executeGraphql(MobileRespondOccurrenceDocument, { id, content, fileUrls })
  },
  async close(id: string) {
    await executeGraphql(MobileCloseOccurrenceDocument, { id })
  },
}
