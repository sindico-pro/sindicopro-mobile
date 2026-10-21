import { type QueryClient } from '@tanstack/react-query'
import { createContext, use, useCallback, useEffect, useReducer, useRef, type ReactNode } from 'react'

import {
  createSessionSchema,
  refreshTokensSchema,
  toSessionUser,
  type SessionUser,
} from '@/features/auth/api/schemas'
import {
  CreateSessionDocument,
  PersonAccountByPersonIdDocument,
  RefreshTokenClientSideDocument,
  SignOutDocument,
} from '@/features/auth/api/operations'
import { canAccessApp } from '@/features/auth/access-policy'
import { AccessDeniedError } from '@/features/auth/errors'
import {
  initialSessionState,
  sessionReducer,
  type SignOutReason,
} from '@/features/auth/session/session-reducer'
import { clearStoredSession, loadStoredSession, saveStoredSession } from '@/features/auth/session/session-storage'
import { isAccessTokenExpired } from '@/features/auth/session/token'
import { tokenMemory } from '@/features/auth/session/token-memory'
import { setAuthBridge, type RefreshResult } from '@/lib/graphql/auth-bridge'
import { executeGraphql } from '@/lib/graphql/client'
import { AppError } from '@/lib/graphql/errors'
import { queryClient as defaultQueryClient } from '@/lib/query/query-client'

type SessionContextValue = {
  status: 'restoring' | 'signedOut' | 'signedIn'
  user: SessionUser | null
  signOutReason: SignOutReason
  isOffline: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

type SessionProviderProps = {
  children: ReactNode
  client?: QueryClient
}

export function SessionProvider({ children, client = defaultQueryClient }: SessionProviderProps) {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState)
  const [isOffline, setIsOffline] = useReducer((_: boolean, next: boolean) => next, false)
  const clientRef = useRef(client)
  const userRef = useRef<SessionUser | null>(null)

  useEffect(() => {
    clientRef.current = client
  }, [client])

  const refreshSession = useCallback(async (): Promise<RefreshResult> => {
    const currentRefresh = tokenMemory.getRefresh()
    if (!currentRefresh) return 'unauthenticated'

    try {
      const data = await executeGraphql(
        RefreshTokenClientSideDocument,
        { data: { refreshToken: currentRefresh } },
        { authenticated: false },
      )
      const parsed = refreshTokensSchema.safeParse(data.refreshTokenClientSide)
      if (!parsed.success || !parsed.data.refreshToken) return 'unauthenticated'

      tokenMemory.set(parsed.data.accessToken, parsed.data.refreshToken)
      if (userRef.current) {
        await saveStoredSession({
          accessToken: parsed.data.accessToken,
          refreshToken: parsed.data.refreshToken,
          user: userRef.current,
        })
      }
      return 'refreshed'
    } catch (error) {
      if (error instanceof AppError && (error.type === 'network' || error.type === 'timeout')) {
        return 'unavailable'
      }
      return 'unauthenticated'
    }
  }, [])

  const invalidate = useCallback(async () => {
    userRef.current = null
    tokenMemory.clear()
    await clearStoredSession()
    clientRef.current.clear()
    dispatch({ type: 'expired' })
  }, [])

  const signOut = useCallback(async () => {
    const personId = userRef.current?.id ?? null
    userRef.current = null
    tokenMemory.clear()
    await clearStoredSession()
    clientRef.current.clear()
    dispatch({ type: 'signedOut', reason: 'signedOut' })
    if (!personId) return
    void executeGraphql(SignOutDocument, { personId }, { authenticated: false }).catch(() => undefined)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await executeGraphql(
      CreateSessionDocument,
      { data: { email: email.trim(), password } },
      { authenticated: false },
    )
    const parsed = createSessionSchema.safeParse(data.createSession)
    if (!parsed.success) {
      throw new AppError('invalid_response', 'Resposta inesperada do servidor')
    }

    const user = toSessionUser(parsed.data.person)
    if (!canAccessApp(user)) throw new AccessDeniedError()

    userRef.current = user
    tokenMemory.set(parsed.data.token, parsed.data.refreshToken)
    try {
      await saveStoredSession({
        accessToken: parsed.data.token,
        refreshToken: parsed.data.refreshToken,
        user,
      })
    } catch (error) {
      userRef.current = null
      tokenMemory.clear()
      throw error
    }

    setIsOffline(false)
    dispatch({ type: 'signedIn', user })
  }, [])

  useEffect(() => {
    setAuthBridge({
      getAccessToken: () => tokenMemory.getAccess(),
      refreshSession,
      onSessionInvalid: () => {
        void invalidate()
      },
    })
    return () => setAuthBridge(null)
  }, [invalidate, refreshSession])

  useEffect(() => {
    let cancelled = false

    async function validateAccount(user: SessionUser) {
      try {
        const data = await executeGraphql(PersonAccountByPersonIdDocument, { person_id: user.id })
        if (cancelled) return
        if (data.personAccountByPersonId.status === 'INACTIVE') {
          await invalidate()
          return
        }
        setIsOffline(false)
      } catch (error) {
        if (cancelled) return
        if (error instanceof AppError && (error.type === 'network' || error.type === 'timeout')) {
          setIsOffline(true)
        }
      }
    }

    async function restore() {
      const stored = await loadStoredSession()
      if (cancelled) return
      if (!stored) {
        dispatch({ type: 'signedOut', reason: null })
        return
      }

      userRef.current = stored.user
      tokenMemory.set(stored.accessToken, stored.refreshToken)

      if (isAccessTokenExpired(stored.accessToken)) {
        const result = await refreshSession()
        if (cancelled) return
        if (result === 'unauthenticated') {
          await invalidate()
          return
        }
        if (result === 'unavailable') {
          setIsOffline(true)
          dispatch({ type: 'restored', user: stored.user })
          return
        }
      }

      if (cancelled) return
      dispatch({ type: 'restored', user: stored.user })
      void validateAccount(stored.user)
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [invalidate, refreshSession])

  const value: SessionContextValue = {
    status: state.status,
    user: state.status === 'signedIn' ? state.user : null,
    signOutReason: state.status === 'signedOut' ? state.reason : null,
    isOffline,
    signIn,
    signOut,
  }

  return <SessionContext value={value}>{children}</SessionContext>
}

export function useSession() {
  const value = use(SessionContext)
  if (!value) {
    throw new Error('useSession deve ser usado dentro de SessionProvider')
  }
  return value
}
