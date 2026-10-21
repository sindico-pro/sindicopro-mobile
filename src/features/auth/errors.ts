import { AppError } from '@/lib/graphql/errors'

export function messageForSignInError(error: unknown) {
  if (!(error instanceof AppError)) return 'Não foi possível entrar. Tente novamente.'
  if (
    error.type === 'network' ||
    error.type === 'timeout' ||
    error.type === 'storage' ||
    error.type === 'configuration'
  )
    return error.message
  if (error.type === 'unauthenticated') return 'E-mail ou senha incorretos, ou conta indisponível.'
  if (error.type === 'invalid_response') return 'Resposta inesperada do servidor. Tente novamente.'
  return 'Não foi possível entrar. Tente novamente.'
}
