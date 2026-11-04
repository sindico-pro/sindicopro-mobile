import { formatDay } from '@/lib/format-date'

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export const taskStatuses = ['TODO', 'IN_PROGRESS', 'DONE'] as const
export type TaskStatus = (typeof taskStatuses)[number]

export const taskDues = ['OVERDUE', 'TODAY', 'TOMORROW'] as const
export type TaskDue = (typeof taskDues)[number]

export const dueChoices = ['NONE', 'TODAY', 'TOMORROW', 'WEEK', 'PICK'] as const
export type DueChoice = (typeof dueChoices)[number]

export function taskDue(value: string | string[] | undefined): TaskDue | null {
  const raw = Array.isArray(value) ? value[0] : value
  return taskDues.find((due) => due === raw) ?? null
}

export function dueFilterLabel(due: TaskDue) {
  if (due === 'OVERDUE') return 'atrasadas'
  if (due === 'TODAY') return 'as de hoje'
  return 'as de amanhã'
}

export function statusLabel(status: TaskStatus) {
  if (status === 'TODO') return 'A fazer'
  if (status === 'IN_PROGRESS') return 'Fazendo'
  return 'Feitas'
}

export function priorityView(priority: string) {
  const key = priority.toUpperCase()
  if (key === 'HIGH' || key === 'URGENT') return { label: 'Alta', tone: 'danger' as const }
  if (key === 'LOW') return { label: 'Baixa', tone: 'neutral' as const }
  return { label: 'Média', tone: 'warning' as const }
}

export function duePhrase(dueDate: string | null, isOverdue: boolean, now = new Date()) {
  if (!dueDate) return 'Sem prazo'
  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return 'Sem prazo'
  const dayStart = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((dayStart(now) - dayStart(due)) / 86_400_000)
  if (isOverdue) {
    const days = Math.max(1, diffDays)
    return days === 1 ? 'Atrasada há 1 dia' : `Atrasada há ${days} dias`
  }
  if (diffDays === 0) return 'Vence hoje'
  if (diffDays === -1) return 'Vence amanhã'
  const day = formatDay(dueDate)
  return day ? `Vence dia ${day}` : 'Sem prazo'
}

export function saoPauloNoon(now: Date, dayOffset: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(now)
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  const noon = new Date(Date.UTC(Number(value('year')), Number(value('month')) - 1, Number(value('day')) + dayOffset, 12))
  return { iso: noon.toISOString(), weekday: value('weekday') }
}

export function dueDateForChoice(choice: DueChoice, pickedDay?: string | null, now = new Date()) {
  if (choice === 'NONE') return null
  if (choice === 'PICK') return pickedDay ? `${pickedDay}T12:00:00.000Z` : null
  if (choice === 'TODAY') return saoPauloNoon(now, 0).iso
  if (choice === 'TOMORROW') return saoPauloNoon(now, 1).iso
  const today = saoPauloNoon(now, 0)
  const index = WEEKDAY_INDEX[today.weekday] ?? 0
  const untilSaturday = (6 - index + 7) % 7
  return saoPauloNoon(now, untilSaturday).iso
}

export function upcomingDays(now = new Date(), count = 14) {
  return Array.from({ length: count }, (_, index) => {
    const iso = saoPauloNoon(now, index).iso
    const day = iso.slice(0, 10)
    const label = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(iso))
    return { day, label }
  })
}
