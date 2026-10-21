import type { SessionUser } from '@/features/auth/api/schemas'

export type SignOutReason = 'signedOut' | 'expired' | null

export type SessionState =
  | { status: 'restoring' }
  | { status: 'signedOut'; reason: SignOutReason }
  | { status: 'signedIn'; user: SessionUser }

export type SessionAction =
  | { type: 'restored'; user: SessionUser }
  | { type: 'signedIn'; user: SessionUser }
  | { type: 'signedOut'; reason?: SignOutReason }
  | { type: 'expired' }

export const initialSessionState: SessionState = { status: 'restoring' }

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'restored':
    case 'signedIn':
      return { status: 'signedIn', user: action.user }
    case 'signedOut':
      return {
        status: 'signedOut',
        reason: action.reason === undefined ? 'signedOut' : action.reason,
      }
    case 'expired':
      return { status: 'signedOut', reason: 'expired' }
    default:
      return state
  }
}
