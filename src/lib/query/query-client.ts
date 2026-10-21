import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query'
import * as Network from 'expo-network'
import { AppState, Platform } from 'react-native'

import { AppError } from '@/lib/graphql/errors'

function retryQuery(failureCount: number, error: unknown) {
  if (!(error instanceof AppError)) return false
  if (error.type !== 'network' && error.type !== 'timeout') return false
  return failureCount < 2
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: retryQuery,
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createQueryClient()

let lifecycleBound = false

export function bindQueryLifecycle() {
  if (lifecycleBound) return
  lifecycleBound = true

  if (typeof Network.addNetworkStateListener === 'function') {
    onlineManager.setEventListener((setOnline) => {
      const subscription = Network.addNetworkStateListener((state) => {
        setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false)
      })
      return () => {
        if (typeof subscription?.remove === 'function') subscription.remove()
      }
    })
  }

  if (Platform.OS === 'web') return

  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (status) => {
      setFocused(status === 'active')
    })
    return () => {
      if (typeof subscription?.remove === 'function') subscription.remove()
    }
  })
}
