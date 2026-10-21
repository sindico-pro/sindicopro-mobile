function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return globalThis.atob(padded)
}

export function readTokenExpiration(token: string): number | null {
  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const decoded = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown }
    return typeof decoded.exp === 'number' ? decoded.exp : null
  } catch {
    return null
  }
}

export function isAccessTokenExpired(token: string, nowMs = Date.now()) {
  const expiration = readTokenExpiration(token)
  if (expiration == null) return false
  return expiration * 1000 <= nowMs
}
