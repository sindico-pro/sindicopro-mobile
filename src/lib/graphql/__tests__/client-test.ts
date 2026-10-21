import { setAuthBridge } from '@/lib/graphql/auth-bridge'
import { executeGraphql } from '@/lib/graphql/client'
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
      appErrorFromGraphqlErrors([
        { message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } },
      ]).type,
    ).toBe('unauthenticated')
    expect(
      appErrorFromGraphqlErrors([{ message: 'nope', extensions: { code: 'FORBIDDEN' } }]).type,
    ).toBe('forbidden')
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
    setAuthBridge(null)
  })

  it('envia o bearer token', async () => {
    setAuthBridge({
      getSessionVersion: () => 1,
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
      getSessionVersion: () => 1,
      getAccessToken: () => null,
      refreshSession,
      onSessionInvalid: jest.fn(),
    })
    const fetchMock = jest.fn(async () =>
      jsonResponse({
        errors: [
          { message: 'Email or Password Incorrect!', extensions: { code: 'UNAUTHENTICATED' } },
        ],
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

  it('não reenvia mutations após renovação', async () => {
    setAuthBridge({
      getSessionVersion: () => 1,
      getAccessToken: () => 'old',
      refreshSession: async () => 'refreshed',
      onSessionInvalid: jest.fn(),
    })
    const fetchMock = jest.fn(async () =>
      jsonResponse({ errors: [{ extensions: { code: 'UNAUTHENTICATED' } }] }),
    )
    await expect(
      executeGraphql({ toString: () => 'mutation Write { write }' }, undefined, {
        fetch: fetchMock,
      }),
    ).rejects.toMatchObject({ type: 'unauthenticated' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('não invalida uma conta nova por resposta de outra geração', async () => {
    let version = 1
    const invalid = jest.fn()
    setAuthBridge({
      getSessionVersion: () => version,
      getAccessToken: () => 'token',
      refreshSession: async () => 'unauthenticated',
      onSessionInvalid: invalid,
    })
    const fetchMock = jest.fn(async () => {
      version = 2
      return jsonResponse({ errors: [{ extensions: { code: 'UNAUTHENTICATED' } }] })
    })
    await expect(
      executeGraphql(protectedDocument, undefined, { fetch: fetchMock }),
    ).rejects.toMatchObject({ type: 'cancelled' })
    expect(invalid).not.toHaveBeenCalled()
  })

  it('encerra a sessão quando a renovação é recusada', async () => {
    const onSessionInvalid = jest.fn()
    setAuthBridge({
      getSessionVersion: () => 1,
      getAccessToken: () => 'old',
      refreshSession: async () => 'unauthenticated',
      onSessionInvalid,
    })
    const fetchMock = jest.fn(async () =>
      jsonResponse({
        errors: [{ message: 'Mobile session expired', extensions: { code: 'UNAUTHENTICATED' } }],
      }),
    )

    await expect(
      executeGraphql(protectedDocument, undefined, { fetch: fetchMock }),
    ).rejects.toMatchObject({ type: 'unauthenticated' })
    expect(onSessionInvalid).toHaveBeenCalledTimes(1)
  })

  it('mantém a sessão quando a renovação falha por rede', async () => {
    const onSessionInvalid = jest.fn()
    setAuthBridge({
      getSessionVersion: () => 1,
      getAccessToken: () => 'old',
      refreshSession: async () => 'unavailable',
      onSessionInvalid,
    })
    const fetchMock = jest.fn(async () =>
      jsonResponse({
        errors: [{ message: 'Unauthorized', extensions: { code: 'UNAUTHENTICATED' } }],
      }),
    )

    await expect(
      executeGraphql(protectedDocument, undefined, { fetch: fetchMock }),
    ).rejects.toMatchObject({ type: 'network' })
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

describe('respostas inesperadas e cancelamento', () => {
  it('encerra sessão se a consulta continuar não autenticada depois de uma renovação', async () => {
    const invalid = jest.fn()
    const refresh = jest.fn(async () => 'refreshed' as const)
    setAuthBridge({
      getSessionVersion: () => 1,
      getAccessToken: () => 'token',
      refreshSession: refresh,
      onSessionInvalid: invalid,
    })
    const request = jest.fn(async () =>
      jsonResponse({ errors: [{ extensions: { code: 'UNAUTHENTICATED' } }] }),
    )
    await expect(
      executeGraphql(protectedDocument, undefined, { fetch: request }),
    ).rejects.toMatchObject({ type: 'unauthenticated' })
    expect(request).toHaveBeenCalledTimes(2)
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(invalid).toHaveBeenCalledTimes(1)
  })
  it.each([{}, { errors: {} }, { errors: [null] }, { data: [] }, { data: null }])(
    'rejeita envelope malformado %j',
    (body) => {
      expect(() => readGraphqlData(body)).toThrow(
        expect.objectContaining({ type: 'invalid_response' }),
      )
    },
  )
  it('não aceita dados parciais de operação com erros', () => {
    expect(() =>
      readGraphqlData({ data: { token: 'partial' }, errors: [{ message: 'SQL stack' }] }),
    ).toThrow(
      expect.objectContaining({
        type: 'server',
        message: 'Não foi possível concluir a solicitação. Tente novamente.',
      }),
    )
  })
  it('não envia requisição já cancelada', async () => {
    const controller = new AbortController()
    controller.abort()
    const request = jest.fn()
    await expect(
      executeGraphql(protectedDocument, undefined, {
        authenticated: false,
        signal: controller.signal,
        fetch: request,
      }),
    ).rejects.toMatchObject({ type: 'cancelled' })
    expect(request).not.toHaveBeenCalled()
  })
  it.each([
    [401, 'unauthenticated'],
    [403, 'forbidden'],
    [500, 'server'],
  ] as const)('classifica HTTP %s sem depender do corpo JSON', async (status, type) => {
    await expect(
      executeGraphql(protectedDocument, undefined, {
        authenticated: false,
        fetch: async () => jsonResponse({}, status),
      }),
    ).rejects.toMatchObject({ type })
  })
})
