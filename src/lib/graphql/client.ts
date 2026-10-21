import { getAuthBridge } from './auth-bridge'
import { AppError, readGraphqlData } from './errors'
import { getGraphqlUrl } from '@/lib/env'

export type GraphqlDocument<TData, TVariables> = {
  toString(): string
  __apiType?: (variables: TVariables) => TData
}
export type GraphqlFetch = (input: string, init?: RequestInit) => Promise<Response>
export type ExecuteOptions = {
  signal?: AbortSignal
  authenticated?: boolean
  accessToken?: string
  timeoutMs?: number
  fetch?: GraphqlFetch
}

export async function executeGraphql<TData, TVariables = Record<string, never>>(
  document: GraphqlDocument<TData, TVariables>,
  variables?: TVariables,
  options: ExecuteOptions = {},
): Promise<TData> {
  const bridge = getAuthBridge()
  const version = bridge?.getSessionVersion()
  const authenticated = options.authenticated ?? true
  const isCurrent = () => getAuthBridge() === bridge && bridge?.getSessionVersion() === version
  try {
    const data = await requestGraphql(document, variables, options)
    if (authenticated && !isCurrent()) throw new AppError('cancelled', 'Solicitação cancelada.')
    return data
  } catch (error) {
    if (!authenticated || !(error instanceof AppError) || error.type !== 'unauthenticated')
      throw error
    if (!bridge || !isCurrent() || options.signal?.aborted)
      throw new AppError('cancelled', 'Solicitação cancelada.')
    const refreshed = await bridge.refreshSession()
    if (!isCurrent() || options.signal?.aborted)
      throw new AppError('cancelled', 'Solicitação cancelada.')
    if (refreshed === 'unauthenticated') {
      bridge.onSessionInvalid()
      throw error
    }
    if (refreshed === 'unavailable')
      throw new AppError('network', 'Não foi possível confirmar sua sessão. Tente novamente.')
    // Mutations may already have effects: never replay them implicitly.
    if (!/^\s*query\b/.test(document.toString())) throw error
    const data = await requestGraphql(document, variables, options)
    if (!isCurrent()) throw new AppError('cancelled', 'Solicitação cancelada.')
    return data
  }
}

async function requestGraphql<TData, TVariables>(
  document: GraphqlDocument<TData, TVariables>,
  variables: TVariables | undefined,
  options: ExecuteOptions,
): Promise<TData> {
  const url = getGraphqlUrl()
  if (options.signal?.aborted) throw new AppError('cancelled', 'Solicitação cancelada.')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000)
  const onAbort = () => controller.abort()
  options.signal?.addEventListener('abort', onAbort)
  try {
    const headers: Record<string, string> = {
      accept: 'application/json',
      'content-type': 'application/json',
    }
    const token =
      options.accessToken ??
      (options.authenticated ?? true ? getAuthBridge()?.getAccessToken() : null)
    if ((options.authenticated ?? true) && !token)
      throw new AppError('unauthenticated', 'Entre novamente.')
    if (token) headers.authorization = `Bearer ${token}`
    const response = await (options.fetch ?? fetch)(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: document.toString(), variables }),
      signal: controller.signal,
    })
    if (response.status === 401) throw new AppError('unauthenticated', 'Entre novamente.')
    if (response.status === 403)
      throw new AppError('forbidden', 'Você não tem acesso a este recurso.')
    if (!response.ok)
      throw new AppError('server', 'Não foi possível falar com o servidor.', {
        statusCode: response.status,
      })
    let body: unknown
    try {
      body = await response.json()
    } catch (error) {
      if (controller.signal.aborted) throw error
      throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
    }
    return readGraphqlData<TData>(body)
  } catch (error) {
    if (options.signal?.aborted) throw new AppError('cancelled', 'Solicitação cancelada.')
    if (controller.signal.aborted)
      throw new AppError('timeout', 'A conexão demorou demais. Tente novamente.')
    if (error instanceof AppError) throw error
    throw new AppError('network', 'Sem conexão. Verifique sua internet e tente novamente.', {
      cause: error,
    })
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', onAbort)
  }
}
