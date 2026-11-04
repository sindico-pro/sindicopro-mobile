import { cleanup, fireEvent, render, screen } from '@testing-library/react-native'

import { TasksScreen } from '@/features/tasks/components/tasks-screen'

const mockPush = jest.fn()
const mockSetParams = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, setParams: mockSetParams }),
  useLocalSearchParams: () => ({ due: 'OVERDUE' }),
}))

jest.mock('@/features/auth/session/session-provider', () => ({
  useSession: () => ({ user: { id: 'person-1', name: 'João' } }),
}))

jest.mock('@/features/condo/use-selected-condo', () => ({
  useSelectedCondo: () => ({
    selected: { id: 'condo-1', name: 'Bosque' },
    loading: false,
    error: null,
    retry: jest.fn(),
  }),
}))

jest.mock('@/features/tasks/use-task-list', () => ({
  useTaskCounts: jest.fn(),
  useTaskList: jest.fn(),
}))

const lists = jest.requireMock('@/features/tasks/use-task-list') as {
  useTaskCounts: jest.Mock
  useTaskList: jest.Mock
}

const item = {
  id: 'task-1',
  title: 'Trocar a lâmpada',
  priority: 'HIGH',
  dueDate: '2026-10-25T12:00:00.000Z',
  isOverdue: true,
  responsibleName: 'João',
  status: 'TODO' as const,
  photoCount: 1,
  commentCount: 2,
}

const doingItem = {
  ...item,
  id: 'task-2',
  title: 'Varrer o hall',
  status: 'IN_PROGRESS' as const,
}

const doneItem = {
  ...item,
  id: 'task-3',
  title: 'Trocar a fechadura',
  status: 'DONE' as const,
}

function queryResult(data: unknown) {
  return {
    data,
    isPending: false,
    isRefetching: false,
    error: null,
    refetch: jest.fn(),
  }
}

function ready() {
  lists.useTaskCounts.mockReturnValue({
    data: { todo: 1, doing: 0, done: 3, overdue: 1, canCreate: true, canExecute: true, mineLocked: false },
    isPending: false,
    isRefetching: false,
    error: null,
    refetch: jest.fn(),
  })
  lists.useTaskList.mockImplementation((_person: string, _condo: string, status: string) => {
    if (status === 'IN_PROGRESS') return queryResult([doingItem])
    if (status === 'DONE') return queryResult([doneItem])
    return queryResult([item])
  })
}

describe('lista de tarefas', () => {
  beforeEach(() => {
    mockPush.mockReset()
    ready()
  })

  afterEach(() => {
    cleanup()
  })

  it('mostra a tarefa, as abas e abre o detalhe', async () => {
    await render(<TasksScreen />)
    expect(screen.getByText('Mostrando: atrasadas')).toBeTruthy()
    expect(screen.getByText('A fazer')).toBeTruthy()
    expect(screen.getByText('Trocar a lâmpada')).toBeTruthy()
    expect(screen.getByText('1 foto')).toBeTruthy()
    expect(screen.queryByText('Fazendo agora')).toBeNull()
    fireEvent.press(screen.getByRole('button', { name: 'Trocar a lâmpada' }))
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/tasks/[id]', params: { id: 'task-1' } })
  })

  it('abre a tarefa para começar', async () => {
    await render(<TasksScreen />)
    fireEvent.press(screen.getByLabelText('Começar'))
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/tasks/[id]',
      params: { id: 'task-1', start: '1' },
    })
  })

  it('mostra as seções do zelador e continua a tarefa em andamento', async () => {
    lists.useTaskCounts.mockReturnValue({
      data: { todo: 1, doing: 1, done: 3, overdue: 0, canCreate: false, canExecute: true, mineLocked: true },
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: jest.fn(),
    })
    await render(<TasksScreen />)
    expect(screen.getByText('Fazendo agora')).toBeTruthy()
    expect(screen.getByText('Para fazer')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ver tarefas feitas (3)' })).toBeTruthy()
    expect(screen.queryByText('A fazer')).toBeNull()
    expect(screen.queryByLabelText('Só as suas tarefas')).toBeNull()
    fireEvent.press(screen.getByLabelText('Continuar'))
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/tasks/[id]', params: { id: 'task-2' } })
  })

  it('esconde a ação rápida quando a pessoa não pode executar', async () => {
    lists.useTaskCounts.mockReturnValue({
      data: { todo: 1, doing: 0, done: 0, overdue: 0, canCreate: false, canExecute: false, mineLocked: true },
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: jest.fn(),
    })
    await render(<TasksScreen />)
    expect(screen.queryByLabelText('Começar')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Nova tarefa' })).toBeNull()
    expect(screen.queryByLabelText('Só as suas tarefas')).toBeNull()
    expect(screen.getByText('Para fazer')).toBeTruthy()
  })
})
