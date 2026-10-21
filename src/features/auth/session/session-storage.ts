import * as SecureStore from 'expo-secure-store'

import { sessionUserSchema, type SessionUser } from '@/features/auth/api/schemas'
import { AppError } from '@/lib/graphql/errors'

const KEYS = {
  access: 'sindicopro.accessToken',
  refresh: 'sindicopro.refreshToken',
  user: 'sindicopro.user',
} as const

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
}

export type StoredSession = {
  accessToken: string
  refreshToken: string
  user: SessionUser
}

export async function loadStoredSession(): Promise<StoredSession | null> {
  if (!(await SecureStore.isAvailableAsync())) return null

  try {
    const [accessToken, refreshToken, userJson] = await Promise.all([
      SecureStore.getItemAsync(KEYS.access, OPTIONS),
      SecureStore.getItemAsync(KEYS.refresh, OPTIONS),
      SecureStore.getItemAsync(KEYS.user, OPTIONS),
    ])

    if (!accessToken || !refreshToken || !userJson) return null

    const user = sessionUserSchema.safeParse(JSON.parse(userJson))
    if (!user.success) {
      await clearStoredSession()
      return null
    }

    return { accessToken, refreshToken, user: user.data }
  } catch {
    return null
  }
}

export async function saveStoredSession(session: StoredSession) {
  if (!(await SecureStore.isAvailableAsync())) {
    throw new AppError('server', 'O armazenamento seguro não está disponível neste dispositivo.')
  }

  await Promise.all([
    SecureStore.setItemAsync(KEYS.access, session.accessToken, OPTIONS),
    SecureStore.setItemAsync(KEYS.refresh, session.refreshToken, OPTIONS),
    SecureStore.setItemAsync(KEYS.user, JSON.stringify(session.user), OPTIONS),
  ])
}

export async function clearStoredSession() {
  if (!(await SecureStore.isAvailableAsync())) return

  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.access, OPTIONS),
    SecureStore.deleteItemAsync(KEYS.refresh, OPTIONS),
    SecureStore.deleteItemAsync(KEYS.user, OPTIONS),
  ])
}
