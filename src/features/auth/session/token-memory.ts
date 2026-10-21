let accessToken: string | null = null
let refreshToken: string | null = null

export const tokenMemory = {
  getAccess() {
    return accessToken
  },
  getRefresh() {
    return refreshToken
  },
  set(nextAccessToken: string, nextRefreshToken: string) {
    accessToken = nextAccessToken
    refreshToken = nextRefreshToken
  },
  clear() {
    accessToken = null
    refreshToken = null
  },
}
