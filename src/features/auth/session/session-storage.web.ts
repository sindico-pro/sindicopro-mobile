// Browser preview only. Native persistence is provided by SecureStore.
import type { StoredSession } from './session-storage'
import { getGraphqlUrl } from '@/lib/env'

let credential: StoredSession | null = null
export async function loadStoredSession() {
  return credential
}
export async function saveStoredSession(refreshToken: string) {
  credential = { version: 1, endpoint: getGraphqlUrl(), refreshToken }
}
export async function clearStoredSession() {
  credential = null
}
