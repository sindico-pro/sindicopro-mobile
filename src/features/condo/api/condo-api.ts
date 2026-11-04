import { z } from 'zod'

import { MobileCondosDocument } from './operations'
import { executeGraphql } from '@/lib/graphql/client'
import { AppError } from '@/lib/graphql/errors'

const condoSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  features: z.array(z.string()),
})

export type Condo = z.infer<typeof condoSchema>

export const condoApi = {
  async list() {
    const data = await executeGraphql(MobileCondosDocument)
    const parsed = z.array(condoSchema).safeParse(data.mobileCondos)
    if (!parsed.success) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
    return parsed.data
  },
}
