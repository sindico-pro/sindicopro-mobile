export type AppErrorType =
  | 'network'
  | 'timeout'
  | 'unauthenticated'
  | 'forbidden'
  | 'bad_request'
  | 'server'
  | 'invalid_response'

export class AppError extends Error {
  readonly type: AppErrorType
  readonly statusCode?: number

  constructor(
    type: AppErrorType,
    message: string,
    options?: { cause?: unknown; statusCode?: number },
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.statusCode = options?.statusCode
    if (options?.cause !== undefined) {
      this.cause = options.cause
    }
  }
}

export type GraphqlErrorBody = {
  message?: string
  extensions?: { code?: string }
}

const UNAUTHENTICATED_MESSAGES = new Set(['Unauthorized', 'Invalid refreshToken'])

export function isUnauthenticatedError(errors: GraphqlErrorBody[]): boolean {
  return errors.some(
    (error) =>
      error.extensions?.code === 'UNAUTHENTICATED' ||
      (error.message != null && UNAUTHENTICATED_MESSAGES.has(error.message)),
  )
}

export function appErrorFromGraphqlErrors(errors: GraphqlErrorBody[]): AppError {
  const first = errors[0]
  const code = first?.extensions?.code
  const message = first?.message?.trim() || 'Resposta inesperada do servidor'

  if (code === 'UNAUTHENTICATED' || isUnauthenticatedError(errors)) {
    return new AppError('unauthenticated', message)
  }
  if (code === 'FORBIDDEN') return new AppError('forbidden', message)
  if (code === 'BAD_REQUEST' || code === 'BAD_USER_INPUT') {
    return new AppError('bad_request', message)
  }
  return new AppError('server', message)
}

export function readGraphqlData<TData>(body: unknown): TData {
  if (!body || typeof body !== 'object') {
    throw new AppError('invalid_response', 'Resposta inválida do servidor')
  }

  const payload = body as { data?: TData | null; errors?: GraphqlErrorBody[] }

  if (payload.errors?.length) {
    throw appErrorFromGraphqlErrors(payload.errors)
  }

  if (payload.data == null) {
    throw new AppError('invalid_response', 'Resposta inválida do servidor')
  }

  return payload.data
}
