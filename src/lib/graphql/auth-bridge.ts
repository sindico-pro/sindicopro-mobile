export type RefreshResult = 'refreshed' | 'unauthenticated' | 'unavailable'

export type AuthBridge = {
  getAccessToken: () => string | null
  refreshSession: () => Promise<RefreshResult>
  onSessionInvalid: () => void
}

let bridge: AuthBridge | null = null

export function setAuthBridge(next: AuthBridge | null) {
  bridge = next
}

export function getAuthBridge() {
  return bridge
}
