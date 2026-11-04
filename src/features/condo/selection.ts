export function shouldPromptCondo(condoCount: number, hadStoredChoice: boolean) {
  return condoCount > 1 && !hadStoredChoice
}

export function resolveSelection(condoIds: string[], storedId: string | null) {
  if (condoIds.length === 1) return condoIds[0]
  if (storedId && condoIds.includes(storedId)) return storedId
  return null
}
