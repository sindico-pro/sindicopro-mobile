import { setAuthBridge } from '@/lib/graphql/auth-bridge'
import { executeGraphql, resetGraphqlClientForTests } from '@/lib/graphql/client'
import { appErrorFromGraphqlErrors, readGraphqlData } from '@/lib/graphql/errors'

const protectedDocument = { toString: () => 'query Protected { protected { ok } }' }

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('graphql errors', () => {
  it('normaliza UNAUTHENTICATED, FORBIDDEN e payload inválido', () => {
    expect(
      appErrorFromGraphqlErrors([{ message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } }])
        .type,
    ).toBe('unauthenticated')
    expect(appErrorFromGraphqlErrors([{ message: 'nope', extensions: { code: 'FORBIDDEN' } }]).type).toBe(
      'forbidden',
    )
    expect(() => readGraphqlData({ data: null })).toThrow(
      expect.objectContaining({ type: 'invalid_response' }),
    )
    expect(() => readGraphqlData('não-json')).toThrow(
      expect.objectContaining({ type: 'invalid_response' }),
    )
  })
})

describe('executeGraphql', () => {
  beforeEach(() => {
    resetGraphqlClientForTests()
    setAuthBridge(null)
  })

  it('envia o bearer token', async () => {
    setAuthBridge({
      getAccessToken: () => 'abc',
      refreshSession: jest.fn(),
      onSessionInvalid: jest.fn(),
    })
    const fetchMock = jest.fn(async (_url: string, init?: RequestInit) => {
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer abc')
      return jsonResponse({ data: { protected: { ok: true } } })
    })

    await executeGraphql(protectedDocument, undefined, { fetch: fetchMock })
  })

  it('não renova a sessão quando o login falha', async () => {
    const refreshSession = jest.fn()
    setAuthBridge({
      getAccessToken: () => null,
      refreshSession,
      onSessionInvalid: jest.fn(),
    })
    const fetchMock = jest.fn(async () =>
      jsonResponse({
        errors: [{ message: 'Email or Password Incorrect!', extensions: { code: 'UNAUTHENTICATED' } }],
      }),
    )

    await expect(
      executeGraphql(
        { toString: () => 'mutation CreateSession { createSession { token } }' },
        undefined,
        { authenticated: false, fetch: fetchMock },
      ),
    ).rejects.toMatchObject({ type: 'unauthenticated' })
    expect(refreshSession).not.toHaveBeenCalled()
  })

  it('faz uma única renovação para requests concorrentes', async () => {
    let token = 'old'
    let refreshCalls = 0
    setAuthBridge({
      getAccessToken: () => token,
      refreshSession: async () => {
        refreshCalls += 1
        await new Promise((resolve) => setTimeout(resolve, 20))
        token = 'new'
        return 'refreshed'
      },
      onSessionInvalid: jest.fn(),
    })
    const fetchMock = jest.fn(async (_url: string, init?: RequestInit) => {
      const authorization = new Headers(init?.headers).get('authorization')
      if (authorization === 'Bearer new') {
        return jsonResponse({ data: { protected: { ok: true } } })
      }
      return jsonResponse({
        errors: [{ message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } }],
      })
    })

    const [first, second] = await Promise.all([
      executeGraphql(protectedDocument, undefined, { fetch: fetchMock }),
      executeGraphql(protectedDocument, undefined, { fetch: fetchMock }),
    ])

    expect(refreshCalls).toBe(1)
    expect(first).toEqual({ protected: { ok: true } })
    expect(second).toEqual({ protected: { ok: true } })
  })

  it('encerra a sessão quando a renovação é recusada', async () => {
    const onSessionInvalid = jest.fn()
    setAuthBridge({
      getAccessToken: () => 'old',
      refreshSession: async () => 'unauthenticated',
      onSessionInvalid,
    })
    const fetchMock = jest.fn(async () =>
      jsonResponse({
        errors: [{ message: 'Invalid refreshToken', extensions: { code: 'UNAUTHENTICATED' } }],
      }),
    )

    await expect(executeGraphql(protectedDocument, undefined, { fetch: fetchMock })).rejects.toMatchObject(
      { type: 'unauthenticated' },
    )
    expect(onSessionInvalid).toHaveBeenCalledTimes(1)
  })

  it('mantém a sessão quando a renovação falha por rede', async () => {
    const onSessionInvalid = jest.fn()
    setAuthBridge({
      getAccessToken: () => 'old',
      refreshSession: async () => 'unavailable',
      onSessionInvalid,
    })
    const fetchMock = jest.fn(async () =>
      jsonResponse({
        errors: [{ message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } }],
      }),
    )

    await expect(executeGraphql(protectedDocument, undefined, { fetch: fetchMock })).rejects.toMatchObject(
      { type: 'network' },
    )
    expect(onSessionInvalid).not.toHaveBeenCalled()
  })

  it('classifica falha de rede e timeout', async () => {
    await expect(
      executeGraphql(protectedDocument, undefined, {
        authenticated: false,
        fetch: jest.fn(async () => {
          throw new TypeError('offline')
        }),
      }),
    ).rejects.toMatchObject({ type: 'network' })

    await expect(
      executeGraphql(protectedDocument, undefined, {
        authenticated: false,
        timeoutMs: 15,
        fetch: jest.fn(
          (_url: string, init?: RequestInit) =>
            new Promise((_resolve, reject) => {
              init?.signal?.addEventListener('abort', () => {
                reject(new DOMException('aborted', 'AbortError'))
              })
            }),
        ),
      }),
    ).rejects.toMatchObject({ type: 'timeout' })
  })

  it('rejeita JSON inválido', async () => {
    await expect(
      executeGraphql(protectedDocument, undefined, {
        authenticated: false,
        fetch: jest.fn(async () => {
          return {
            ok: true,
            status: 200,
            json: async () => {
              throw new SyntaxError('bad')
            },
          } as unknown as Response
        }),
      }),
    ).rejects.toMatchObject({ type: 'invalid_response' })
  })
})
