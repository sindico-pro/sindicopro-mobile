import { renderRouter, screen } from 'expo-router/testing-library'

import type { SessionUser } from '@/features/auth/api/schemas'
import { tokenWithExpiration } from '@/test/jwt'

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
  loadAsync: jest.fn(),
}))

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => undefined),
  hideAsync: jest.fn(async () => undefined),
}))

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
}

const user: SessionUser = {
  id: 'person-1',
  name: 'Ana',
  email: 'ana@example.com',
  status: 'ACTIVE',
}

describe('rotas protegidas', () => {
  beforeEach(() => {
    executeGraphql.mockReset()
    const writes = jest.requireMock('@/features/auth/session/session-storage')
    writes.saveStoredSession.mockResolvedValue(undefined)
    writes.clearStoredSession.mockResolvedValue(undefined)
    storage.loadStoredSession.mockReset()
    executeGraphql.mockResolvedValue({
      mobileMe: user,
      refreshMobileSession: {
        accessToken: tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600),
        refreshToken: 'rotated',
      },
    })
  })

  it('mostra o login quando não há sessão', async () => {
    storage.loadStoredSession.mockResolvedValue(null)

    await renderRouter('./src/app', { initialUrl: '/' })

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeTruthy()
    expect(screen.queryByText(/Olá, Ana/)).toBeNull()
  })

  it('mostra o painel quando a sessão foi restaurada', async () => {
    storage.loadStoredSession.mockResolvedValue({
      accessToken: tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600),
      refreshToken: 'refresh',
      user,
    })

    await renderRouter('./src/app', { initialUrl: '/' })

    expect(await screen.findByText('Olá, Ana')).toBeTruthy()
    expect(screen.queryByLabelText('E-mail')).toBeNull()
  })

  it('não deixa o login acessível quando há sessão', async () => {
    storage.loadStoredSession.mockResolvedValue({
      accessToken: tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600),
      refreshToken: 'refresh',
      user,
    })

    await renderRouter('./src/app', { initialUrl: '/sign-in' })

    expect(await screen.findByText('Olá, Ana')).toBeTruthy()
    expect(screen.queryByLabelText('E-mail')).toBeNull()
  })
})
