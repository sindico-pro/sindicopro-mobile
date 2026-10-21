import { z } from 'zod'

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  status: z.literal('ACTIVE'),
})
export type SessionUser = z.infer<typeof sessionUserSchema>

export const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
})
export type SessionTokens = z.infer<typeof tokensSchema>
export const createSessionSchema = tokensSchema.extend({ person: sessionUserSchema })
