import { getAuthBridge, type RefreshResult } from '@/lib/graphql/auth-bridge'
import { AppError, readGraphqlData } from '@/lib/graphql/errors'
import { getGraphqlUrl } from '@/lib/env'

const DEFAULT_TIMEOUT_MS = 15_000

export type GraphqlDocument<TData, TVariables> = {
  toString(): string
  __apiType?: (variables: TVariables) => TData
}

export type GraphqlFetch = (input: string, init?: RequestInit) => Promise<Response>

export type ExecuteOptions = {
  signal?: AbortSignal
  authenticated?: boolean
  timeoutMs?: number
  fetch?: GraphqlFetch
}

let refreshInFlight: Promise<RefreshResult> | null = null

export function resetGraphqlClientForTests() {
  refreshInFlight = null
}

function refreshSessionSingleFlight(): Promise<RefreshResult> {
  if (!refreshInFlight) {
    const current = getAuthBridge()
    const run = current ? current.refreshSession() : Promise.resolve<RefreshResult>('unauthenticated')
    refreshInFlight = run.finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

export async function executeGraphql<TData, TVariables = Record<string, never>>(
  document: GraphqlDocument<TData, TVariables>,
  variables?: TVariables,
  options: ExecuteOptions = {},
): Promise<TData> {
  const authenticated = options.authenticated ?? true

  try {
    return await requestGraphql(document, variables, options)
  } catch (error) {
    if (!authenticated || !(error instanceof AppError) || error.type !== 'unauthenticated') {
      throw error
    }

    const refreshed = await refreshSessionSingleFlight()
    if (refreshed === 'refreshed') {
      return await requestGraphql(document, variables, options)
    }
    if (refreshed === 'unauthenticated') {
      getAuthBridge()?.onSessionInvalid()
      throw error
    }

    throw new AppError('network', 'Sem conexão. Verifique sua internet e tente novamente.', {
      cause: error,
    })
  }
}

async function requestGraphql<TData, TVariables>(
  document: GraphqlDocument<TData, TVariables>,
  variables: TVariables | undefined,
  options: ExecuteOptions,
): Promise<TData> {
  if (options.signal?.aborted) {
    throw options.signal.reason ?? new DOMException('The operation was aborted.', 'AbortError')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const abortFromCaller = () => controller.abort()
  options.signal?.addEventListener('abort', abortFromCaller)

  try {
    const headers: Record<string, string> = {
      accept: 'application/json',
      'content-type': 'application/json',
    }
    const authenticated = options.authenticated ?? true
    if (authenticated) {
      const token = getAuthBridge()?.getAccessToken()
      if (token) headers.authorization = `Bearer ${token}`
    }

    const doFetch: GraphqlFetch = options.fetch ?? fetch
    let response: Response
    try {
      response = await doFetch(getGraphqlUrl(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: document.toString(), variables }),
        signal: controller.signal,
      })
    } catch (error) {
      if (options.signal?.aborted) throw error
      if (controller.signal.aborted) {
        throw new AppError('timeout', 'A conexão demorou demais. Tente novamente.')
      }
      throw new AppError('network', 'Sem conexão. Verifique sua internet e tente novamente.', {
        cause: error,
      })
    }

    let json: unknown
    try {
      json = await response.json()
    } catch (error) {
      if (!response.ok) {
        throw new AppError('server', 'Não foi possível falar com o servidor.', {
          cause: error,
          statusCode: response.status,
        })
      }
      throw new AppError('invalid_response', 'Resposta inválida do servidor', { cause: error })
    }

    if (!response.ok && (!json || typeof json !== 'object' || !('errors' in json))) {
      throw new AppError('server', 'Não foi possível falar com o servidor.', {
        statusCode: response.status,
      })
    }

    return readGraphqlData<TData>(json)
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', abortFromCaller)
  }
}
