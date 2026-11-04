import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'

import { HomeScreen } from '@/features/home/components/home-screen'

const mockNavigate = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, setParams: jest.fn() }),
}))

jest.mock('@/features/auth/session/session-provider', () => ({
  useSession: () => ({ user: { id: 'person-1', name: 'Ana', email: 'ana@example.com', status: 'ACTIVE' } }),
}))

jest.mock('@/features/condo/use-selected-condo', () => ({
  useSelectedCondo: jest.fn(),
}))

jest.mock('@/features/home/use-home', () => ({
  useHome: jest.fn(),
}))

const condo = jest.requireMock('@/features/condo/use-selected-condo') as {
  useSelectedCondo: jest.Mock
}
const home = jest.requireMock('@/features/home/use-home') as { useHome: jest.Mock }

const selected = { id: 'condo-1', name: 'Edifício Ana', features: ['occurrence', 'kanban', 'realization'] }

function readyHome(data: unknown, extras: Record<string, unknown> = {}) {
  condo.useSelectedCondo.mockReturnValue({
    condos: [selected],
    selected,
    loading: false,
    error: null,
    select: jest.fn(),
    retry: jest.fn(),
  })
  home.useHome.mockReturnValue({
    data,
    isPending: false,
    isRefetching: false,
    error: null,
    refetch: jest.fn(),
    ...extras,
  })
}

describe('início', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  it('mostra carregando, erro e vazio', async () => {
    condo.useSelectedCondo.mockReturnValue({
      condos: [],
      selected: null,
      loading: true,
      error: null,
      select: jest.fn(),
      retry: jest.fn(),
    })
    home.useHome.mockReturnValue({ data: undefined, isPending: true, isRefetching: false, error: null, refetch: jest.fn() })
    await render(<HomeScreen />)
    expect(screen.getByTestId('loading')).toBeTruthy()
    await cleanup()

    condo.useSelectedCondo.mockReturnValue({
      condos: [],
      selected: null,
      loading: false,
      error: 'Sem conexão',
      select: jest.fn(),
      retry: jest.fn(),
    })
    const failed = await render(<HomeScreen />)
    expect(failed.getByText('Sem conexão')).toBeTruthy()
    expect(failed.getByRole('button', { name: 'Tentar novamente' })).toBeTruthy()
    await cleanup()

    condo.useSelectedCondo.mockReturnValue({
      condos: [],
      selected: null,
      loading: false,
      error: null,
      select: jest.fn(),
      retry: jest.fn(),
    })
    home.useHome.mockReturnValue({ data: undefined, isPending: false, isRefetching: false, error: null, refetch: jest.fn() })
    await render(<HomeScreen />)
    expect(screen.getByText('Escolha um condomínio para ver o início.')).toBeTruthy()
  })

  it('abre a lista já filtrada a partir do card', async () => {
    readyHome({
      occurrences: { open: 3, withoutResponse: 1, pendingManager: 2, closed: 4 },
      tasks: { overdue: 5, dueToday: 0, dueTomorrow: 1 },
      recentRealizations: [{ id: 'r1', title: 'Pintura', heldIn: '2026-10-21T12:00:00.000Z', coverImageUrl: null }],
    })
    await render(<HomeScreen />)
    fireEvent.press(screen.getByRole('button', { name: 'Ocorrências Sem resposta, 1' }))
    fireEvent.press(screen.getByRole('button', { name: 'Tarefas Atrasadas, 5' }))
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/occurrences?filter=WITHOUT_RESPONSE')
    expect(mockNavigate).toHaveBeenNthCalledWith(2, '/tasks?due=OVERDUE')
    expect(screen.getByText('Pintura')).toBeTruthy()
  })
})
