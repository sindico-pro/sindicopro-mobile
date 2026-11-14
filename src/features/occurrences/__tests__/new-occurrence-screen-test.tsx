import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

import { NewOccurrenceScreen } from '@/features/occurrences/components/new-occurrence-screen'

const mockReplace = jest.fn()
const mockCreate = jest.fn<
  Promise<{ id: string; title: string }>,
  [{ title: string; description: string; occurredAt: string; photoUris?: string[] }]
>(async () => ({ id: 'occ-1', title: 'Portão' }))

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

jest.mock('@expo/ui/community/datetime-picker', () => ({
  __esModule: true,
  default: () => null,
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

jest.mock('@/features/occurrences/use-occurrence', () => ({
  useOccurrenceAccess: () => ({
    data: { canCreate: true },
    isPending: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

jest.mock('@/features/occurrences/use-occurrence-actions', () => ({
  useOccurrenceActions: () => ({ create: mockCreate, busy: false }),
}))

describe('nova ocorrência', () => {
  beforeEach(() => {
    mockCreate.mockClear()
    mockReplace.mockReset()
  })

  it('abre a ocorrência com título, descrição e o momento do picker', async () => {
    const before = Date.now()
    await render(<NewOccurrenceScreen />)
    fireEvent.changeText(screen.getByLabelText('Título'), 'Portão')
    fireEvent.changeText(screen.getByLabelText('Descrição'), 'Não fecha direito')
    fireEvent.press(screen.getByRole('button', { name: 'Abrir ocorrência' }))
    await waitFor(() => expect(mockCreate).toHaveBeenCalled())
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Portão',
        description: 'Não fecha direito',
        photoUris: [],
      }),
    )
    const occurredAt = new Date(mockCreate.mock.calls[0][0].occurredAt ?? '').getTime()
    expect(Math.abs(occurredAt - before)).toBeLessThan(90_000)
    expect(new Date(occurredAt).getSeconds()).toBe(0)
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/occurrences/[id]', params: { id: 'occ-1' } })
  })
})
