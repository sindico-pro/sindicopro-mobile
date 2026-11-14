export function localDay(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function localTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function recentDays(count: number, now = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now)
    date.setDate(date.getDate() - index)
    const label =
      index === 0
        ? 'Hoje'
        : index === 1
          ? 'Ontem'
          : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
    return { day: localDay(date), label }
  })
}

export function combineLocal(day: string, time: string) {
  const matchDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  const matchTime = /^(\d{2}):(\d{2})$/.exec(time)
  if (!matchDay || !matchTime) return null
  const date = new Date(
    Number(matchDay[1]),
    Number(matchDay[2]) - 1,
    Number(matchDay[3]),
    Number(matchTime[1]),
    Number(matchTime[2]),
  )
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== Number(matchDay[1])) return null
  return date
}
