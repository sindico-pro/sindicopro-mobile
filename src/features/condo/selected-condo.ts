import * as SecureStore from 'expo-secure-store'
import { z } from 'zod'

import { resolveSelection } from './selection'
import { AppError } from '@/lib/graphql/errors'

export const SELECTED_CONDO_KEY = 'sindicopro.selected-condo.v1'
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
}
const storedSchema = z.object({
  version: z.literal(1),
  personId: z.string().min(1),
  condoId: z.string().min(1),
})

async function available() {
  if (!(await SecureStore.isAvailableAsync())) {
    throw new AppError('storage', 'O armazenamento seguro está indisponível. Tente novamente.')
  }
}

export async function loadSelectedCondo(personId: string): Promise<string | null> {
  try {
    await available()
    const raw = await SecureStore.getItemAsync(SELECTED_CONDO_KEY, OPTIONS)
    if (!raw) return null
    const parsed = storedSchema.safeParse(JSON.parse(raw))
    if (!parsed.success || parsed.data.personId !== personId) return null
    return parsed.data.condoId
  } catch (error) {
    if (error instanceof SyntaxError) return null
    throw new AppError('storage', 'Não foi possível ler o condomínio salvo. Tente novamente.', {
      cause: error,
    })
  }
}

export async function saveSelectedCondo(personId: string, condoId: string) {
  try {
    await available()
    await SecureStore.setItemAsync(
      SELECTED_CONDO_KEY,
      JSON.stringify({ version: 1, personId, condoId }),
      OPTIONS,
    )
  } catch (error) {
    throw new AppError('storage', 'Não foi possível salvar o condomínio. Tente novamente.', {
      cause: error,
    })
  }
}

export async function clearSelectedCondo() {
  try {
    await available()
    await SecureStore.deleteItemAsync(SELECTED_CONDO_KEY, OPTIONS)
  } catch (error) {
    throw new AppError('storage', 'Não foi possível apagar o condomínio salvo. Tente novamente.', {
      cause: error,
    })
  }
}

export { resolveSelection }
