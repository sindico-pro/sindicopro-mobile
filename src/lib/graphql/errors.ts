import { z } from 'zod'

export type AppErrorType =
  | 'network'
  | 'timeout'
  | 'unauthenticated'
  | 'forbidden'
  | 'bad_request'
  | 'server'
  | 'invalid_response'
  | 'storage'
  | 'configuration'
  | 'cancelled'
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
    if (options?.cause !== undefined) this.cause = options.cause
  }
}
const errorSchema = z
  .object({
    message: z.string().optional(),
    extensions: z.object({ code: z.string().optional() }).passthrough().optional(),
  })
  .passthrough()
export type GraphqlErrorBody = z.infer<typeof errorSchema>
export function appErrorFromGraphqlErrors(errors: GraphqlErrorBody[]): AppError {
  if (
    errors.some(
      (error) =>
        error.extensions?.code === 'UNAUTHENTICATED' ||
        ['Unauthorized', 'Mobile session expired', 'Invalid credentials'].includes(
          error.message ?? '',
        ),
    )
  ) {
    return new AppError('unauthenticated', 'Sua sessão não está disponível. Entre novamente.')
  }
  if (errors.some((error) => error.extensions?.code === 'FORBIDDEN'))
    return new AppError('forbidden', 'Você não tem acesso a este recurso.')
  if (
    errors.some((error) => ['BAD_REQUEST', 'BAD_USER_INPUT'].includes(error.extensions?.code ?? ''))
  )
    return new AppError('bad_request', 'Confira os dados informados.')
  return new AppError('server', 'Não foi possível concluir a solicitação. Tente novamente.')
}
export function readGraphqlData<TData>(body: unknown): TData {
  const parsed = z
    .object({
      data: z.record(z.unknown()).nullable().optional(),
      errors: z.array(errorSchema).optional(),
    })
    .safeParse(body)
  if (!parsed.success) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
  if (parsed.data.errors?.length) throw appErrorFromGraphqlErrors(parsed.data.errors)
  if (!parsed.data.data) throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
  return parsed.data.data as TData
}
