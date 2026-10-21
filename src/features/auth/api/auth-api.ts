import { createSessionSchema, sessionUserSchema, tokensSchema } from './schemas'
import {
  CreateSessionDocument,
  CurrentUserDocument,
  RefreshSessionDocument,
  RevokeSessionDocument,
} from './operations'
import { executeGraphql } from '@/lib/graphql/client'
import { AppError } from '@/lib/graphql/errors'

function parse<T>(
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } },
  value: unknown,
): T {
  const result = schema.safeParse(value)
  if (!result.success) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
  return result.data
}

export const authApi = {
  async signIn(email: string, password: string) {
    const data = await executeGraphql(
      CreateSessionDocument,
      { data: { email, password } },
      { authenticated: false },
    )
    return parse(createSessionSchema, data.createMobileSession)
  },
  async refresh(refreshToken: string) {
    const data = await executeGraphql(
      RefreshSessionDocument,
      { data: { refreshToken } },
      { authenticated: false },
    )
    return parse(tokensSchema, data.refreshMobileSession)
  },
  async me(accessToken: string) {
    const data = await executeGraphql(CurrentUserDocument, undefined, {
      authenticated: false,
      accessToken,
    })
    return parse(sessionUserSchema, data.mobileMe)
  },
  async revoke(refreshToken: string) {
    await executeGraphql(
      RevokeSessionDocument,
      { refreshToken },
      { authenticated: false, timeoutMs: 4000 },
    )
  },
}
