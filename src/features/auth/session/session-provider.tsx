import { type QueryClient } from '@tanstack/react-query'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { AppState } from 'react-native'

import { authApi } from '@/features/auth/api/auth-api'
import type { SessionUser, SessionTokens } from '@/features/auth/api/schemas'
import { initialSessionState, sessionReducer, type SignOutReason } from './session-reducer'
import { clearStoredSession, loadStoredSession, saveStoredSession } from './session-storage'
import { readTokenExpiration } from './token'
import { tokenMemory } from './token-memory'
import { setAuthBridge, type RefreshResult } from '@/lib/graphql/auth-bridge'
import { AppError } from '@/lib/graphql/errors'
import { queryClient as defaultQueryClient } from '@/lib/query/query-client'

const IDENTITY_KEY = ['session', 'identity'] as const

type SessionContextValue = {
  status: 'restoring' | 'signedOut' | 'signedIn' | 'recovery'
  user: SessionUser | null
  signOutReason: SignOutReason
  recoveryMessage: string | null
  retry: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({
  children,
  client = defaultQueryClient,
}: {
  children: ReactNode
  client?: QueryClient
}) {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState)
  const [tokenRevision, updateTokenRevision] = useReducer((value: number) => value + 1, 0)
  const generation = useRef(0)
  const mounted = useRef(true)
  const storageQueue = useRef<Promise<unknown>>(Promise.resolve())
  const refreshFlight = useRef<Promise<RefreshResult> | null>(null)
  const loginFlight = useRef<Promise<void> | null>(null)
  const restoreFlight = useRef<{ epoch: number; promise: Promise<void> } | null>(null)
  const recovery = useRef<'restore' | 'signOut'>('restore')
  const recoveryRefresh = useRef<string | null>(null)
  const current = useCallback(
    (epoch: number) => mounted.current && epoch === generation.current,
    [],
  )
  const user = useSyncExternalStore(
    useCallback((notify) => client.getQueryCache().subscribe(notify), [client]),
    useCallback(() => client.getQueryData<SessionUser>(IDENTITY_KEY) ?? null, [client]),
    () => null,
  )

  const serializeStorage = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const pending = storageQueue.current.catch(() => undefined).then(task)
    storageQueue.current = pending
    return pending
  }, [])

  const reset = useCallback(
    async (reason: SignOutReason) => {
      const epoch = ++generation.current
      tokenMemory.clear()
      await client.cancelQueries()
      client.clear()
      recoveryRefresh.current = null
      // Block protected routes even if deleting the persisted credential fails.
      recovery.current = 'signOut'
      dispatch({ type: 'restoring' })
      try {
        await serializeStorage(clearStoredSession)
        if (current(epoch)) {
          dispatch({ type: 'signedOut', reason })
          return true
        }
      } catch {
        if (current(epoch))
          dispatch({
            type: 'recovery',
            message: 'Não foi possível apagar a sessão salva. Tente sair novamente.',
          })
      }
      return false
    },
    [client, current, serializeStorage],
  )

  const publish = useCallback(
    async (tokens: SessionTokens, identity: SessionUser, epoch: number) => {
      if (!current(epoch)) return
      if (readTokenExpiration(tokens.accessToken) === null)
        throw new AppError('invalid_response', 'Resposta inesperada do servidor.')
      await serializeStorage(async () => {
        if (current(epoch)) await saveStoredSession(tokens.refreshToken)
      })
      if (!current(epoch)) return
      tokenMemory.set(tokens.accessToken, tokens.refreshToken)
      recoveryRefresh.current = null
      client.setQueryData(IDENTITY_KEY, identity)
      updateTokenRevision()
      dispatch({ type: 'signedIn' })
    },
    [client, current, serializeStorage],
  )

  const refreshSession = useCallback((): Promise<RefreshResult> => {
    if (refreshFlight.current) return refreshFlight.current
    const epoch = generation.current
    const refreshToken = tokenMemory.getRefresh()
    if (!refreshToken) return Promise.resolve('unauthenticated')
    const run = async (): Promise<RefreshResult> => {
      recoveryRefresh.current = refreshToken
      let next: SessionTokens | null = null
      try {
        next = await authApi.refresh(refreshToken)
        if (!current(epoch)) return 'unavailable'
        // Keep the rotated credential available for recovery if identity validation fails.
        recoveryRefresh.current = next.refreshToken
        await serializeStorage(async () => {
          if (current(epoch)) await saveStoredSession(next!.refreshToken)
        })
        if (!current(epoch)) return 'unavailable'
        tokenMemory.set(next.accessToken, next.refreshToken)
        const identity = await authApi.me(next.accessToken)
        await publish(next, identity, epoch)
        return current(epoch) ? 'refreshed' : 'unavailable'
      } catch (error) {
        if (!current(epoch)) return 'unavailable'
        if (error instanceof AppError && error.type === 'unauthenticated') return 'unauthenticated'
        recovery.current = 'restore'
        tokenMemory.clear()
        await client.cancelQueries()
        client.clear()
        dispatch({
          type: 'recovery',
          message: 'Não foi possível confirmar sua sessão. Tente novamente ou saia da conta.',
        })
        return 'unavailable'
      }
    }
    const pending = run().finally(() => {
      if (refreshFlight.current === pending) refreshFlight.current = null
    })
    refreshFlight.current = pending
    return pending
  }, [client, current, publish, serializeStorage])

  const signOut = useCallback(async () => {
    const refreshToken = tokenMemory.getRefresh() ?? recoveryRefresh.current
    // Clearing local access does not depend on the network being available.
    const revoked = refreshToken
      ? authApi.revoke(refreshToken).then(
          () => true,
          () => false,
        )
      : Promise.resolve(true)
    const epoch = generation.current + 1
    const cleared = await reset('signedOut')
    if (!(await revoked) && cleared && current(epoch))
      dispatch({ type: 'signedOut', reason: 'localOnly' })
  }, [reset, current])

  const signIn = useCallback(
    (email: string, password: string): Promise<void> => {
      if (loginFlight.current) return loginFlight.current
      const epoch = ++generation.current
      const run = async () => {
        const data = await authApi.signIn(email.trim(), password)
        if (!current(epoch)) {
          void authApi.revoke(data.refreshToken).catch(() => undefined)
          return
        }
        try {
          await publish(data, data.person, epoch)
        } catch (error) {
          void authApi.revoke(data.refreshToken).catch(() => undefined)
          if (current(epoch)) {
            tokenMemory.clear()
            try {
              await serializeStorage(clearStoredSession)
            } catch {
              recovery.current = 'signOut'
              dispatch({
                type: 'recovery',
                message: 'Não foi possível apagar a sessão salva. Tente sair novamente.',
              })
            }
          }
          throw error
        }
      }
      const pending = run().finally(() => {
        if (loginFlight.current === pending) loginFlight.current = null
      })
      loginFlight.current = pending
      return pending
    },
    [current, publish, serializeStorage],
  )

  const restore = useCallback((): Promise<void> => {
    if (restoreFlight.current && current(restoreFlight.current.epoch))
      return restoreFlight.current.promise
    const epoch = ++generation.current
    recovery.current = 'restore'
    dispatch({ type: 'restoring' })
    const run = async () => {
      try {
        const stored = await serializeStorage(loadStoredSession)
        if (!current(epoch)) return
        const refreshToken = recoveryRefresh.current ?? stored?.refreshToken
        if (!refreshToken) {
          dispatch({ type: 'signedOut', reason: null })
          return
        }
        recoveryRefresh.current = refreshToken
        const tokens = await authApi.refresh(refreshToken)
        if (!current(epoch)) return
        recoveryRefresh.current = tokens.refreshToken
        await serializeStorage(async () => {
          if (current(epoch)) await saveStoredSession(tokens.refreshToken)
        })
        if (!current(epoch)) return
        const identity = await authApi.me(tokens.accessToken)
        await publish(tokens, identity, epoch)
      } catch (error) {
        if (!current(epoch)) return
        if (error instanceof AppError && error.type === 'unauthenticated') {
          await reset('expired')
          return
        }
        dispatch({
          type: 'recovery',
          message:
            error instanceof AppError && error.type === 'storage'
              ? error.message
              : 'Não foi possível confirmar sua sessão. Verifique a conexão e tente novamente.',
        })
      }
    }
    const promise = run().finally(() => {
      if (restoreFlight.current?.epoch === epoch) restoreFlight.current = null
    })
    restoreFlight.current = { epoch, promise }
    return promise
  }, [current, publish, reset, serializeStorage])

  useEffect(() => {
    mounted.current = true
    tokenMemory.clear()
    void restore()
    return () => {
      mounted.current = false
      generation.current += 1
      tokenMemory.clear()
      client.clear()
    }
  }, [restore, client])

  useEffect(() => {
    setAuthBridge({
      getAccessToken: () => tokenMemory.getAccess(),
      getSessionVersion: () => generation.current,
      refreshSession,
      onSessionInvalid: () => {
        void reset('expired')
      },
    })
    return () => setAuthBridge(null)
  }, [refreshSession, reset])

  useEffect(() => {
    if (state.status !== 'signedIn') return
    const epoch = generation.current
    const check = () => {
      if (!current(epoch)) return
      const expiration = readTokenExpiration(tokenMemory.getAccess() ?? '')
      if (expiration === null || expiration * 1000 - Date.now() <= 30_000) {
        void refreshSession().then((result) => {
          if (current(epoch) && result === 'unauthenticated') void reset('expired')
        })
      }
    }
    const expiration = readTokenExpiration(tokenMemory.getAccess() ?? '')
    const delay = Math.min(
      2_147_000_000,
      Math.max(1000, (expiration ?? 0) * 1000 - Date.now() - 30_000),
    )
    const timer = setTimeout(check, delay)
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') check()
    })
    return () => {
      clearTimeout(timer)
      subscription.remove()
    }
  }, [state.status, tokenRevision, refreshSession, reset, current])

  return (
    <SessionContext
      value={{
        status: state.status,
        user: state.status === 'signedIn' ? user : null,
        signOutReason: state.status === 'signedOut' ? state.reason : null,
        recoveryMessage: state.status === 'recovery' ? state.message : null,
        retry: () => (recovery.current === 'signOut' ? signOut() : restore()),
        signIn,
        signOut,
      }}
    >
      {children}
    </SessionContext>
  )
}
export function useSession() {
  const value = use(SessionContext)
  if (!value) throw new Error('useSession deve ser usado dentro de SessionProvider')
  return value
}
