import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { QueryClient } from '@tanstack/react-query'
import { Text } from 'react-native'
import { useEffect } from 'react'

import { authApi } from '@/features/auth/api/auth-api'
import { SessionProvider, useSession } from '@/features/auth/session/session-provider'
import * as storage from '@/features/auth/session/session-storage'
import { tokenMemory } from '@/features/auth/session/token-memory'
import { getAuthBridge } from '@/lib/graphql/auth-bridge'
import { AppError } from '@/lib/graphql/errors'
import { tokenWithExpiration } from '@/test/jwt'

jest.mock('@/features/auth/api/auth-api', () => ({
  authApi: { signIn: jest.fn(), refresh: jest.fn(), me: jest.fn(), revoke: jest.fn() },
}))
jest.mock('@/features/auth/session/session-storage', () => ({
  loadStoredSession: jest.fn(),
  saveStoredSession: jest.fn(),
  clearStoredSession: jest.fn(),
}))
const api = jest.mocked(authApi)
const saved = jest.mocked(storage)
const user = { id: 'person-1', name: 'Ana', email: 'ana@example.com', status: 'ACTIVE' as const }
const tokens = () => ({
  accessToken: tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600),
  refreshToken: 'new-refresh',
})
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
let session: ReturnType<typeof useSession>
function Probe() {
  const value = useSession()
  useEffect(() => {
    session = value
  }, [value])
  return (
    <>
      <Text>{value.status}</Text>
      <Text>{value.user?.name ?? 'no-user'}</Text>
      <Text
        onPress={() => {
          void value.signOut()
        }}
      >
        sair
      </Text>
      <Text
        onPress={() => {
          void value.retry()
        }}
      >
        retry
      </Text>
    </>
  )
}
function setup(client = new QueryClient()) {
  return render(
    <SessionProvider client={client}>
      <Probe />
    </SessionProvider>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  tokenMemory.clear()
  saved.loadStoredSession.mockResolvedValue(null)
  saved.saveStoredSession.mockResolvedValue(undefined)
  saved.clearStoredSession.mockResolvedValue(undefined)
  api.signIn.mockResolvedValue({ ...tokens(), person: user })
  api.refresh.mockResolvedValue(tokens())
  api.me.mockResolvedValue(user)
  api.revoke.mockResolvedValue(undefined)
})
it('abre deslogado sem credenciais e não faz chamadas ao servidor', async () => {
  const view = await setup()
  expect(await view.findByText('signedOut')).toBeTruthy()
  expect(api.refresh).not.toHaveBeenCalled()
})
it('só libera o dashboard depois da identidade confirmada pelo servidor', async () => {
  saved.loadStoredSession.mockResolvedValue({
    version: 1,
    endpoint: 'http://localhost:7400/graphql',
    refreshToken: 'old',
  })
  const identity = deferred<typeof user>()
  api.me.mockReturnValue(identity.promise)
  const view = await setup()
  await waitFor(() => expect(api.me).toHaveBeenCalled())
  expect(view.queryByText('Ana')).toBeNull()
  await act(async () => {
    identity.resolve(user)
  })
  expect(await view.findByText('signedIn')).toBeTruthy()
  expect(saved.saveStoredSession).toHaveBeenCalledWith('new-refresh')
})
it('falha de rede no restore preserva credencial, bloqueia dashboard e permite repetir', async () => {
  saved.loadStoredSession.mockResolvedValue({
    version: 1,
    endpoint: 'http://localhost:7400/graphql',
    refreshToken: 'old',
  })
  api.refresh.mockRejectedValueOnce(new AppError('network', 'offline'))
  const view = await setup()
  expect(await view.findByText('recovery')).toBeTruthy()
  expect(saved.clearStoredSession).not.toHaveBeenCalled()
  expect(view.queryByText('Ana')).toBeNull()
  fireEvent.press(view.getByText('retry'))
  expect(await view.findByText('Ana')).toBeTruthy()
})
it('expiração do refresh encerra a sessão', async () => {
  saved.loadStoredSession.mockResolvedValue({
    version: 1,
    endpoint: 'http://localhost:7400/graphql',
    refreshToken: 'old',
  })
  api.refresh.mockRejectedValue(new AppError('unauthenticated', 'expired'))
  const view = await setup()
  expect(await view.findByText('signedOut')).toBeTruthy()
  expect(session.signOutReason).toBe('expired')
  expect(saved.clearStoredSession).toHaveBeenCalled()
})
it('logout limpa cache e credencial mesmo sem rede, revogando só a sessão mobile', async () => {
  const client = new QueryClient()
  const view = await setup(client)
  await view.findByText('signedOut')
  await act(async () => {
    await session.signIn(' ana@example.com ', 'senha')
  })
  client.setQueryData(['private'], { secret: 'A' })
  api.revoke.mockRejectedValue(new AppError('network', 'offline'))
  await act(async () => {
    await session.signOut()
  })
  expect(client.getQueryCache().getAll()).toHaveLength(0)
  expect(api.revoke).toHaveBeenCalledWith('new-refresh')
  expect(tokenMemory.getAccess()).toBeNull()
  expect(await view.findByText('signedOut')).toBeTruthy()
})
it('falha ao apagar credenciais mantém tela de recuperação, sem falsa saída', async () => {
  const view = await setup()
  await view.findByText('signedOut')
  await act(async () => {
    await session.signIn('ana@example.com', 'senha')
  })
  saved.clearStoredSession.mockRejectedValueOnce(new Error('keychain'))
  await act(async () => {
    await session.signOut()
  })
  expect(await view.findByText('recovery')).toBeTruthy()
  expect(session.user).toBeNull()
  await act(async () => {
    await session.retry()
  })
  expect(await view.findByText('signedOut')).toBeTruthy()
})
it('resposta de login atrasada não restaura sessão após saída', async () => {
  const view = await setup()
  await view.findByText('signedOut')
  const login = deferred<Awaited<ReturnType<typeof authApi.signIn>>>()
  api.signIn.mockReturnValue(login.promise)
  let pending!: Promise<void>
  await act(async () => {
    pending = session.signIn('ana@example.com', 'senha')
  })
  await act(async () => {
    await session.signOut()
  })
  await act(async () => {
    login.resolve({ ...tokens(), person: user })
    await pending
  })
  expect(view.queryByText('Ana')).toBeNull()
  expect(saved.saveStoredSession).not.toHaveBeenCalled()
  expect(api.revoke).toHaveBeenCalledWith('new-refresh')
})
it('compartilha uma única renovação entre chamadas simultâneas', async () => {
  const view = await setup()
  await view.findByText('signedOut')
  await act(async () => {
    await session.signIn('ana@example.com', 'senha')
  })
  await act(async () => {
    await Promise.all([getAuthBridge()!.refreshSession(), getAuthBridge()!.refreshSession()])
  })
  expect(api.refresh).toHaveBeenCalledTimes(1)
})
it('falha de persistência no login não publica sessão e revoga a sessão nova', async () => {
  const view = await setup()
  await view.findByText('signedOut')
  saved.saveStoredSession.mockRejectedValueOnce(new AppError('storage', 'keychain'))
  await act(async () => {
    await expect(session.signIn('ana@example.com', 'senha')).rejects.toMatchObject({
      type: 'storage',
    })
  })
  expect(view.queryByText('Ana')).toBeNull()
  expect(api.revoke).toHaveBeenCalledWith('new-refresh')
})
it('logout durante escrita pendente apaga a credencial depois que a escrita terminar', async () => {
  const view = await setup()
  await view.findByText('signedOut')
  const writing = deferred<void>()
  saved.saveStoredSession.mockReturnValueOnce(writing.promise)
  let login!: Promise<void>
  await act(async () => {
    login = session.signIn('ana@example.com', 'senha')
  })
  await waitFor(() => expect(saved.saveStoredSession).toHaveBeenCalled())
  let logout!: Promise<void>
  await act(async () => {
    logout = session.signOut()
  })
  await act(async () => {
    writing.resolve()
    await login
    await logout
  })
  expect(view.queryByText('Ana')).toBeNull()
  expect(saved.clearStoredSession).toHaveBeenCalled()
  expect(tokenMemory.getAccess()).toBeNull()
})
