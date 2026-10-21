import * as SecureStore from 'expo-secure-store'
import { z } from 'zod'

import { getGraphqlUrl } from '@/lib/env'
import { AppError } from '@/lib/graphql/errors'

const KEY = 'sindicopro.mobile-session.v1'
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
}
const credentialSchema = z.object({
  version: z.literal(1),
  endpoint: z.string().url(),
  refreshToken: z.string().min(1),
})
export type StoredSession = z.infer<typeof credentialSchema>

async function available() {
  if (!(await SecureStore.isAvailableAsync()))
    throw new AppError('storage', 'O armazenamento seguro está indisponível. Tente novamente.')
}

export async function loadStoredSession(): Promise<StoredSession | null> {
  try {
    await available()
    const raw = await SecureStore.getItemAsync(KEY, OPTIONS)
    if (!raw) return null
    const parsed = credentialSchema.safeParse(JSON.parse(raw))
    if (!parsed.success || parsed.data.endpoint !== getGraphqlUrl()) {
      await clearStoredSession()
      return null
    }
    return parsed.data
  } catch (error) {
    if (error instanceof SyntaxError) {
      await clearStoredSession()
      return null
    }
    throw new AppError('storage', 'Não foi possível ler a sessão salva. Tente novamente.', {
      cause: error,
    })
  }
}

export async function saveStoredSession(refreshToken: string) {
  try {
    await available()
    await SecureStore.setItemAsync(
      KEY,
      JSON.stringify({ version: 1, endpoint: getGraphqlUrl(), refreshToken }),
      OPTIONS,
    )
  } catch (error) {
    throw new AppError(
      'storage',
      'Não foi possível salvar a sessão com segurança. Tente novamente.',
      { cause: error },
    )
  }
}

export async function clearStoredSession() {
  try {
    await available()
    // Also remove credentials written by the earlier implementation, without using them.
    for (const key of [
      KEY,
      'sindicopro.accessToken',
      'sindicopro.refreshToken',
      'sindicopro.user',
    ]) {
      await SecureStore.deleteItemAsync(key, OPTIONS)
    }
  } catch (error) {
    throw new AppError('storage', 'Não foi possível apagar a sessão salva. Tente novamente.', {
      cause: error,
    })
  }
}
