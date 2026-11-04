import { z } from 'zod'

import { MobileOccurrencesDocument } from './operations'
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
}
