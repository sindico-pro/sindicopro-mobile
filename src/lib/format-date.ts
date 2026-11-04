export function formatDay(value: string | null | undefined) {
  const date = parseDate(value)
  if (!date) return null
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date)
}

export function formatWhen(value: string | null | undefined) {
  const date = parseDate(value)
  if (!date) return null
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function parseDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
