import { isAccessTokenExpired, readTokenExpiration } from '@/features/auth/session/token'
import { tokenWithExpiration } from '@/test/jwt'

describe('token', () => {
  it('lê o exp e detecta access token vencido', () => {
    const expired = tokenWithExpiration(Math.floor(Date.now() / 1000) - 60)
    const valid = tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600)

    expect(readTokenExpiration(expired)).toEqual(expect.any(Number))
    expect(isAccessTokenExpired(expired)).toBe(true)
    expect(isAccessTokenExpired(valid)).toBe(false)
  })

  it('não considera expirado um token sem exp', () => {
    expect(readTokenExpiration('sem-pontos')).toBeNull()
    expect(isAccessTokenExpired('sem-pontos')).toBe(false)
  })
})
