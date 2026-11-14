import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'

import { RealizationsScreen } from '@/features/realizations/components/realizations-screen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/features/auth/session/session-provider', () => ({
  useSession: () => ({ user: { id: 'person-1', name: 'Ana' } }),
}))

jest.mock('@/features/condo/use-selected-condo', () => ({
  useSelectedCondo: () => ({
    selected: { id: 'condo-1', name: 'Bosque' },
    loading: false,
    error: null,
    retry: jest.fn(),
  }),
}))

jest.mock('@/features/realizations/use-realizations', () => ({
  useRealizations: jest.fn(),
}))

jest.mock('@/features/realizations/use-realization', () => ({
  useRealizationAccess: jest.fn(),
}))

const lists = jest.requireMock('@/features/realizations/use-realizations') as {
  useRealizations: jest.Mock
}
const access = jest.requireMock('@/features/realizations/use-realization') as {
  useRealizationAccess: jest.Mock
}

const item = {
  id: 'real-1',
  title: 'Pintura do hall',
  heldIn: '2026-11-01T12:00:00.000Z',
  coverImageUrl: null,
}

describe('lista de realizações', () => {
  beforeEach(() => {
    mockPush.mockReset()
    access.useRealizationAccess.mockReturnValue({ data: { canCreate: true } })
  })

  afterEach(() => {
    cleanup()
  })

  it('explica quando o condomínio ainda não tem realizações', async () => {
    lists.useRealizations.mockReturnValue({
      data: [],
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: jest.fn(),
    })
    await render(<RealizationsScreen />)
    expect(screen.getByText('Nenhuma realização neste condomínio.')).toBeTruthy()
  })

  it('mostra a realização, abre o detalhe e oferece criar', async () => {
    lists.useRealizations.mockReturnValue({
      data: [item],
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: jest.fn(),
    })
    await render(<RealizationsScreen />)
    expect(screen.getByText('Pintura do hall')).toBeTruthy()
    fireEvent.press(screen.getByRole('button', { name: 'Pintura do hall' }))
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/realizations/[id]', params: { id: 'real-1' } })
    fireEvent.press(screen.getByRole('button', { name: 'Nova realização' }))
    expect(mockPush).toHaveBeenCalledWith('/realizations/new')
  })
})
