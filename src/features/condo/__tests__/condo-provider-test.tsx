import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { Text } from 'react-native'

import { condoApi } from '@/features/condo/api/condo-api'
import { CondoProvider, useSelectedCondo } from '@/features/condo/condo-provider'

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: jest.fn(), back: jest.fn() }),
}))

jest.mock('@/features/auth/session/session-provider', () => ({
  useSession: jest.fn(),
}))

jest.mock('@/features/condo/api/condo-api', () => ({
  condoApi: { list: jest.fn() },
}))

jest.mock('@/features/condo/selected-condo', () => ({
  loadSelectedCondo: jest.fn(async () => null),
  saveSelectedCondo: jest.fn(async () => undefined),
}))

const useSession = jest.requireMock('@/features/auth/session/session-provider').useSession as jest.Mock
const list = jest.mocked(condoApi.list)
let client: QueryClient

function Probe() {
  const value = useSelectedCondo()
  const settledEmpty = !value.loading && !value.error && value.condos.length === 0
  return <Text>{value.loading ? 'loading' : settledEmpty ? 'empty' : 'ready'}</Text>
}

function renderProvider() {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  function Wrap({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return render(
    <CondoProvider>
      <Probe />
    </CondoProvider>,
    { wrapper: Wrap },
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  useSession.mockReturnValue({ user: null })
  list.mockResolvedValue([])
})

afterEach(() => {
  client.unmount()
})

it('sem usuário não trata a lista como vazia', async () => {
  await renderProvider()
  expect(await screen.findByText('loading')).toBeTruthy()
  expect(screen.queryByText('empty')).toBeNull()
  expect(list).not.toHaveBeenCalled()
})

it('lista vazia só depois da busca do usuário', async () => {
  useSession.mockReturnValue({
    user: { id: 'person-1', name: 'Ana', email: 'ana@example.com', status: 'ACTIVE' },
  })
  await renderProvider()
  await waitFor(() => expect(list).toHaveBeenCalled())
  expect(await screen.findByText('empty')).toBeTruthy()
})
