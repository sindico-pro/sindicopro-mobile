import { ZodError } from 'zod'

import { AppError } from '@/lib/graphql/errors'

export class AccessDeniedError extends Error {
  constructor() {
    super('Este app é destinado a síndicos e suas equipes')
    this.name = 'AccessDeniedError'
  }
}

const KNOWN_MESSAGES: Record<string, string> = {
  'Email or Password Incorrect!': 'E-mail ou senha incorretos',
  'This account is inactive, contact the administrator':
    'Esta conta está inativa. Fale com o administrador.',
}

export function messageForSignInError(error: unknown) {
  if (error instanceof AccessDeniedError) return error.message
  if (error instanceof ZodError) return 'Resposta inesperada do servidor. Tente novamente.'
  if (!(error instanceof AppError)) return 'Não foi possível entrar. Tente novamente.'

  const known = KNOWN_MESSAGES[error.message]
  if (known) return known
  if (error.type === 'network' || error.type === 'timeout') return error.message
  if (error.type === 'invalid_response') return 'Resposta inesperada do servidor. Tente novamente.'
  if (error.type === 'unauthenticated') return 'E-mail ou senha incorretos'
  return 'Não foi possível entrar. Tente novamente.'
}
