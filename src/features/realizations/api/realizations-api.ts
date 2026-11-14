import { z } from 'zod'

import {
  MobileCreateRealizationDocument,
  MobileRealizationAccessDocument,
  MobileRealizationDocument,
  MobileRealizationsDocument,
} from './operations'
import { executeGraphql } from '@/lib/graphql/client'
import { AppError } from '@/lib/graphql/errors'

const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  heldIn: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
})

const detailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  heldIn: z.string().nullable(),
  photoUrls: z.array(z.string()),
  beforePhotoUrls: z.array(z.string()),
  canCreate: z.boolean(),
})

const accessSchema = z.object({ canCreate: z.boolean() })

export type RealizationItem = z.infer<typeof itemSchema>
export type RealizationDetail = z.infer<typeof detailSchema>

function parsed<T>(result: z.SafeParseReturnType<unknown, T>) {
  if (!result.success) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
  return result.data
}

export const realizationsApi = {
  async list(condoId: string) {
    const data = await executeGraphql(MobileRealizationsDocument, { condoId, limit: 50, offset: 0 })
    return parsed(z.array(itemSchema).safeParse(data.mobileRealizations))
  },
  async detail(id: string) {
    const data = await executeGraphql(MobileRealizationDocument, { id })
    return parsed(detailSchema.safeParse(data.mobileRealization))
  },
  async access(condoId: string) {
    const data = await executeGraphql(MobileRealizationAccessDocument, { condoId })
    return parsed(accessSchema.safeParse(data.mobileRealizationAccess))
  },
  async create(input: {
    condoId: string
    title: string
    description: string
    heldIn: string
    photoUrls: string[]
    beforePhotoUrls?: string[]
  }) {
    const data = await executeGraphql(MobileCreateRealizationDocument, { data: input })
    return parsed(z.object({ id: z.string(), title: z.string() }).safeParse(data.mobileCreateRealization))
  },
}
