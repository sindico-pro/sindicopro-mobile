import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { QueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Text } from 'react-native'

import type { SessionUser } from '@/features/auth/api/schemas'
import { SessionProvider, useSession } from '@/features/auth/session/session-provider'
import { tokenMemory } from '@/features/auth/session/token-memory'
import { AppError } from '@/lib/graphql/errors'
import { tokenWithExpiration } from '@/test/jwt'

jest.mock('@/lib/graphql/client', () => ({
  executeGraphql: jest.fn(),
}))

jest.mock('@/features/auth/session/session-storage', () => ({
  loadStoredSession: jest.fn(),
  saveStoredSession: jest.fn(),
  clearStoredSession: jest.fn(),
}))

const { executeGraphql } = jest.requireMock('@/lib/graphql/client') as {
  executeGraphql: jest.Mock
}
const storage = jest.requireMock('@/features/auth/session/session-storage') as {
  loadStoredSession: jest.Mock
  saveStoredSession: jest.Mock
  clearStoredSession: jest.Mock
}

const user: SessionUser = {
  id: 'person-1',
  name: 'Ana',
  email: 'ana@example.com',
  isEmployee: false,
  createdByPersonId: null,
  showPanel: true,
  profileSlugs: ['external-condominium-manager'],
  status: 'ACTIVE',
}

function Probe() {
  const session = useSession()
  const [error, setError] = useState('')

  if (session.status === 'restoring') return <Text>loading</Text>
  if (session.status === 'signedIn') {
    return (
      <>
        <Text>hello {session.user?.name}</Text>
        <Text>{session.isOffline ? 'offline' : 'online'}</Text>
        <Text onPress={() => void session.signOut()}>sair</Text>
      </>
    )
  }

  return (
    <>
      <Text>{`signed-out ${session.signOutReason ?? 'none'}`}</Text>
      <Text
        onPress={() => {
          void session.signIn('ana@example.com', 'segredo').catch((caught: unknown) => {
            setError(caught instanceof Error ? caught.message : 'erro')
          })
        }}>
        login
      </Text>
      {error ? <Text>{error}</Text> : null}
    </>
  )
}

function renderSession() {
  return render(
    <SessionProvider client={new QueryClient()}>
      <Probe />
    </SessionProvider>,
  )
}

describe('SessionProvider', () => {
  beforeEach(() => {
    tokenMemory.clear()
    executeGraphql.mockReset()
    storage.loadStoredSession.mockReset()
    storage.saveStoredSession.mockReset()
    storage.clearStoredSession.mockReset()
    storage.loadStoredSession.mockResolvedValue(null)
    storage.saveStoredSession.mockResolvedValue(undefined)
    storage.clearStoredSession.mockResolvedValue(undefined)
    executeGraphql.mockResolvedValue({ personAccountByPersonId: { status: 'ACTIVE' } })
  })

  it('abre deslogado quando não há sessão salva', async () => {
    const view = await renderSession()
    expect(await view.findByText('signed-out none')).toBeTruthy()
  })

  it('restaura a sessão salva', async () => {
    storage.loadStoredSession.mockResolvedValue({
      accessToken: tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600),
      refreshToken: 'refresh',
      user,
    })

    const view = await renderSession()
    expect(await view.findByText('hello Ana')).toBeTruthy()
  })

  it('encerra a sessão quando o token venceu e o refresh falha', async () => {
    storage.loadStoredSession.mockResolvedValue({
      accessToken: tokenWithExpiration(Math.floor(Date.now() / 1000) - 60),
      refreshToken: 'refresh',
      user,
    })
    executeGraphql.mockRejectedValue(new AppError('unauthenticated', 'Invalid refreshToken'))

    const view = await renderSession()
    expect(await view.findByText('signed-out expired')).toBeTruthy()
    expect(storage.clearStoredSession).toHaveBeenCalled()
  })

  it('mantém a sessão offline quando o refresh falha por rede', async () => {
    storage.loadStoredSession.mockResolvedValue({
      accessToken: tokenWithExpiration(Math.floor(Date.now() / 1000) - 60),
      refreshToken: 'refresh',
      user,
    })
    executeGraphql.mockRejectedValue(
      new AppError('network', 'Sem conexão. Verifique sua internet e tente novamente.'),
    )

    const view = await renderSession()
    expect(await view.findByText('hello Ana')).toBeTruthy()
    expect(await view.findByText('offline')).toBeTruthy()
    expect(storage.clearStoredSession).not.toHaveBeenCalled()
  })

  it('limpa o armazenamento e o cache no logout, mesmo se o backend estiver offline', async () => {
    storage.loadStoredSession.mockResolvedValue({
      accessToken: tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600),
      refreshToken: 'refresh',
      user,
    })
    executeGraphql.mockImplementation(async (_document: unknown, variables?: { personId?: string }) => {
      if (variables?.personId) {
        throw new AppError('network', 'Sem conexão. Verifique sua internet e tente novamente.')
      }
      return { personAccountByPersonId: { status: 'ACTIVE' } }
    })
    const client = new QueryClient()
    client.setQueryData(['condos', user.id], [{ id: 'condo-1' }])

    const view = await render(
      <SessionProvider client={client}>
        <Probe />
      </SessionProvider>,
    )
    fireEvent.press(await view.findByText('sair'))

    expect(await view.findByText('signed-out signedOut')).toBeTruthy()
    expect(storage.clearStoredSession).toHaveBeenCalled()
    expect(client.getQueryCache().getAll()).toHaveLength(0)
    await waitFor(() => {
      expect(executeGraphql).toHaveBeenCalledWith(
        expect.anything(),
        { personId: 'person-1' },
        { authenticated: false },
      )
    })
  })

  it('recusa perfil sem acesso e não persiste a sessão', async () => {
    executeGraphql.mockResolvedValue({
      createSession: {
        token: 'access',
        refreshToken: 'refresh',
        person: {
          id: 'person-2',
          name: 'Fornecedor',
          email: 'fornecedor@example.com',
          status: 'ACTIVE',
          createdByPersonId: null,
          isEmployee: false,
          showPanel: false,
          personContext: [{ profile: { slug: 'supplier' } }],
        },
      },
    })

    const view = await renderSession()
    fireEvent.press(await view.findByText('login'))

    expect(await view.findByText('Este app é destinado a síndicos e suas equipes')).toBeTruthy()
    expect(storage.saveStoredSession).not.toHaveBeenCalled()
  })
})
