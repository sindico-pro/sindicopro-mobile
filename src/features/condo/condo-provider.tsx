import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { condoApi, type Condo } from './api/condo-api'
import { loadSelectedCondo, saveSelectedCondo } from './selected-condo'
import { resolveSelection, shouldPromptCondo } from './selection'
import { useSession } from '@/features/auth/session/session-provider'
import { errorMessage } from '@/lib/graphql/errors'

type CondoContextValue = {
  condos: Condo[]
  selected: Condo | null
  loading: boolean
  error: string | null
  select: (condoId: string) => Promise<boolean>
  retry: () => void
}

const CondoContext = createContext<CondoContextValue | null>(null)

export function CondoProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const prompted = useRef<string | null>(null)
  const { user } = useSession()
  const personId = user?.id ?? null
  const query = useQuery({
    queryKey: ['condos', personId],
    enabled: Boolean(personId),
    queryFn: () => condoApi.list(),
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [resolvedFor, setResolvedFor] = useState<string | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    if (!personId || !query.data) return
    let cancelled = false
    const ids = query.data.map((condo) => condo.id)
    void loadSelectedCondo(personId)
      .then(async (storedId) => {
        if (cancelled) return
        const hadStored = Boolean(storedId && ids.includes(storedId))
        const next = resolveSelection(ids, storedId)
        setSelectedId(next)
        setResolvedFor(personId)
        if (next && next !== storedId) await saveSelectedCondo(personId, next)
        if (shouldPromptCondo(ids.length, hadStored) && prompted.current !== personId) {
          prompted.current = personId
          router.navigate('/condo-picker')
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setResolvedFor(personId)
        setStorageError(errorMessage(error))
      })
    return () => {
      cancelled = true
    }
  }, [personId, query.data, router])

  const select = useCallback(
    async (condoId: string) => {
      if (!personId) return false
      try {
        await saveSelectedCondo(personId, condoId)
        setSelectedId(condoId)
        setResolvedFor(personId)
        setStorageError(null)
        return true
      } catch (error) {
        setStorageError(errorMessage(error))
        return false
      }
    },
    [personId],
  )

  const selected = query.data?.find((condo) => condo.id === selectedId) ?? null
  const waitingForChoice = Boolean(personId && query.data && resolvedFor !== personId)
  const listReady = Boolean(personId) && query.isSuccess

  const value: CondoContextValue = {
    condos: listReady ? (query.data ?? []) : [],
    selected: waitingForChoice ? null : selected,
    loading: !personId || (!query.error && !storageError && (query.isPending || waitingForChoice)),
    error: query.error ? errorMessage(query.error) : storageError,
    select,
    retry: () => {
      void query.refetch()
    },
  }

  return <CondoContext value={value}>{children}</CondoContext>
}

export function useSelectedCondo() {
  const value = use(CondoContext)
  if (!value) throw new Error('useSelectedCondo precisa do CondoProvider')
  return value
}
