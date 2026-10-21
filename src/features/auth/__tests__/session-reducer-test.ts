import { sessionReducer } from '@/features/auth/session/session-reducer'
it('bloqueia a área autenticada durante restauração, recuperação e saída', () => {
  expect(sessionReducer({ status: 'restoring' }, { type: 'signedIn' })).toEqual({
    status: 'signedIn',
  })
  expect(sessionReducer({ status: 'signedIn' }, { type: 'recovery', message: 'rede' })).toEqual({
    status: 'recovery',
    message: 'rede',
  })
  expect(sessionReducer({ status: 'signedIn' }, { type: 'expired' })).toEqual({
    status: 'signedOut',
    reason: 'expired',
  })
})
