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

export function bindQueryLifecycle() {
  onlineManager.setEventListener((setOnline) => {
    let changed = false
    const subscription = Network.addNetworkStateListener((state) => {
      changed = true
      setOnline(state.isConnected !== false && state.isInternetReachable !== false)
    })
    void Network.getNetworkStateAsync()
      .then((state) => {
        if (!changed) setOnline(state.isConnected !== false && state.isInternetReachable !== false)
      })
      .catch(() => undefined)
    return () => subscription.remove()
  })
  if (Platform.OS !== 'web') {
    focusManager.setEventListener((setFocused) => {
      const subscription = AppState.addEventListener('change', (status) =>
        setFocused(status === 'active'),
      )
      return () => subscription.remove()
    })
  }
  return () => {
    onlineManager.setEventListener(() => () => undefined)
    if (Platform.OS !== 'web') focusManager.setEventListener(() => () => undefined)
  }
}
