export type SignOutReason = 'signedOut' | 'localOnly' | 'expired' | null
export type SessionState =
  | { status: 'restoring' }
  | { status: 'signedOut'; reason: SignOutReason }
  | { status: 'signedIn' }
  | { status: 'recovery'; message: string }
export type SessionAction =
  | { type: 'restoring' }
  | { type: 'signedIn' }
  | { type: 'signedOut'; reason?: SignOutReason }
  | { type: 'expired' }
  | { type: 'recovery'; message: string }
export const initialSessionState: SessionState = { status: 'restoring' }
export function sessionReducer(_state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'signedIn':
      return { status: 'signedIn' }
    case 'restoring':
      return { status: 'restoring' }
    case 'signedOut':
      return {
        status: 'signedOut',
        reason: action.reason === undefined ? 'signedOut' : action.reason,
      }
    case 'expired':
      return { status: 'signedOut', reason: 'expired' }
    case 'recovery':
      return { status: 'recovery', message: action.message }
  }
}
