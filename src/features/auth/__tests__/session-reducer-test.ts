import { sessionReducer, type SessionState } from '@/features/auth/session/session-reducer'
import type { SessionUser } from '@/features/auth/api/schemas'

const user: SessionUser = {
  id: 'person-1',
  name: 'Ana',
  email: 'ana@example.com',
  isEmployee: false,
  createdByPersonId: null,
  showPanel: true,
  profileSlugs: ['external-condominium-manager'],
  status: 'ACTIVE',
}

describe('sessionReducer', () => {
  const restoring: SessionState = { status: 'restoring' }

  it('restaura, encerra e expira a sessão', () => {
    const signedIn = sessionReducer(restoring, { type: 'restored', user })
    expect(signedIn).toEqual({ status: 'signedIn', user })

    expect(sessionReducer(signedIn, { type: 'signedOut', reason: null })).toEqual({
      status: 'signedOut',
      reason: null,
    })
    expect(sessionReducer(signedIn, { type: 'expired' })).toEqual({
      status: 'signedOut',
      reason: 'expired',
    })
  })
})
