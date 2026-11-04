import { z } from 'zod'

import { MobileHomeDocument } from './operations'
import { executeGraphql } from '@/lib/graphql/client'
import { AppError } from '@/lib/graphql/errors'

const count = z.number().int()
const homeSchema = z.object({
  occurrences: z
    .object({
      open: count,
      withoutResponse: count,
      pendingManager: count,
      closed: count,
    })
    .nullable(),
  tasks: z
    .object({
      overdue: count,
      dueToday: count,
      dueTomorrow: count,
    })
    .nullable(),
  recentRealizations: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        heldIn: z.string().nullable(),
        coverImageUrl: z.string().nullable(),
      }),
    )
    .nullable(),
})

export type HomeData = z.infer<typeof homeSchema>

export const homeApi = {
  async load(condoId: string) {
    const data = await executeGraphql(MobileHomeDocument, { condoId })
    const parsed = homeSchema.safeParse(data.mobileHome)
    if (!parsed.success) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
    return parsed.data
  },
}
