import { useLocalSearchParams, useRouter } from 'expo-router'
import { BookMarked, Calendar } from 'lucide-react-native'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { FilterChips } from '@/components/ui/filter-chips'
import { Icon } from '@/components/ui/icon'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import { useHome } from '@/features/home/use-home'
import {
  occurrenceFilter,
  type OccurrenceFilter,
  type OccurrenceItem,
} from '@/features/occurrences/api/occurrences-api'
import { useOccurrences } from '@/features/occurrences/use-occurrences'
import { formatDay } from '@/lib/format-date'
import { errorMessage } from '@/lib/graphql/errors'
import { useTheme } from '@/hooks/use-theme'
import type { BadgeTone } from '@/components/ui/badge'

const options: { value: OccurrenceFilter; label: string }[] = [
  { value: 'OPEN', label: 'Abertas' },
  { value: 'WITHOUT_RESPONSE', label: 'Sem resposta' },
  { value: 'PENDING_MANAGER', label: 'Aguardando' },
  { value: 'CLOSED', label: 'Encerradas' },
]

const statusBadge: Record<string, { label: string; tone: BadgeTone }> = {
  OPEN: { label: 'Aberta', tone: 'danger' },
  CLOSED: { label: 'Encerrada', tone: 'success' },
  FROZEN: { label: 'Congelada', tone: 'neutral' },
}

export function OccurrencesScreen() {
  const theme = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ filter?: string }>()
  const filter = occurrenceFilter(params.filter)
  const { user } = useSession()
  const condo = useSelectedCondo()
  const condoId = condo.selected?.id ?? null
  const home = useHome(user?.id ?? null, condoId)
  const list = useOccurrences(user?.id ?? null, condoId, filter)
  const counts = home.data?.occurrences

  return (
    <Screen edges={['left', 'right']}>
      <View style={styles.filter}>
        <FilterChips
          onChange={(value) => router.setParams({ filter: value })}
          options={options.map((option) => ({
            ...option,
            count: counts
              ? option.value === 'OPEN'
                ? counts.open
                : option.value === 'WITHOUT_RESPONSE'
                  ? counts.withoutResponse
                  : option.value === 'PENDING_MANAGER'
                    ? counts.pendingManager
                    : counts.closed
              : undefined,
          }))}
          value={filter}
        />
      </View>
      {condo.loading || (condo.selected && list.isPending) ? <StateView loading /> : null}
      {!condo.loading && condo.error ? <StateView error={condo.error} onRetry={condo.retry} /> : null}
      {!condo.loading && !condo.error && !condo.selected ? (
        <StateView empty="Escolha um condomínio para ver as ocorrências." />
      ) : null}
      {condo.selected && list.error ? (
        <StateView error={errorMessage(list.error)} onRetry={() => void list.refetch()} />
      ) : null}
      {list.data ? (
        <FlatList
          contentContainerStyle={list.data.length === 0 ? styles.empty : styles.list}
          data={list.data}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <StateView
              empty="Nenhuma ocorrência neste filtro."
              emptyIcon={<BookMarked color={theme.textSecondary} size={40} />}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={list.isRefetching}
              tintColor={theme.primary}
              onRefresh={() => void list.refetch()}
            />
          }
          renderItem={({ item }) => <OccurrenceRow item={item} />}
        />
      ) : null}
    </Screen>
  )
}

function OccurrenceRow({ item }: { item: OccurrenceItem }) {
  const theme = useTheme()
  const when = formatDay(item.occurredAt ?? item.createdAt)
  const badge = statusBadge[item.status] ?? { label: item.status, tone: 'neutral' as const }

  return (
    <ListRow
      badge={badge}
      meta={
        when ? (
          <View style={styles.meta}>
            <Icon color={theme.textSecondary} icon={Calendar} size={14} />
            <ThemedText themeColor="textSecondary" type="small">
              {when}
            </ThemedText>
          </View>
        ) : null
      }
      title={item.title}
    />
  )
}

const styles = StyleSheet.create({
  filter: {
    paddingVertical: Spacing.three,
  },
  list: {
    paddingTop: Spacing.two,
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
  },
})
