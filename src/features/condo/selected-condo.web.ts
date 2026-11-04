import { resolveSelection } from './selection'

let stored: { personId: string; condoId: string } | null = null

export const SELECTED_CONDO_KEY = 'sindicopro.selected-condo.v1'

export async function loadSelectedCondo(personId: string) {
  return stored?.personId === personId ? stored.condoId : null
}

export async function saveSelectedCondo(personId: string, condoId: string) {
  stored = { personId, condoId }
}

export async function clearSelectedCondo() {
  stored = null
}

export { resolveSelection }
