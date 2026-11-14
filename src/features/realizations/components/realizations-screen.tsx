import { useRouter } from 'expo-router'
import { ImageOff, Waypoints } from 'lucide-react-native'
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'

import { ThemedText } from '@/components/themed-text'
import { Card } from '@/components/ui/card'
import { Fab } from '@/components/ui/fab'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import type { RealizationItem } from '@/features/realizations/api/realizations-api'
import { useRealizationAccess } from '@/features/realizations/use-realization'
import { useRealizations } from '@/features/realizations/use-realizations'
import { useTheme } from '@/hooks/use-theme'
import { formatDay } from '@/lib/format-date'
import { errorMessage } from '@/lib/graphql/errors'

export function RealizationsScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { user } = useSession()
  const condo = useSelectedCondo()
  const condoId = condo.selected?.id ?? null
  const list = useRealizations(user?.id ?? null, condoId)
  const access = useRealizationAccess(user?.id ?? null, condoId)

  return (
    <Screen edges={['left', 'right']}>
      {condo.loading || (condo.selected && list.isPending) ? <StateView loading /> : null}
      {!condo.loading && condo.error ? <StateView error={condo.error} onRetry={condo.retry} /> : null}
      {!condo.loading && !condo.error && !condo.selected ? (
        <StateView empty="Escolha um condomínio para ver as realizações." />
      ) : null}
      {condo.selected && list.error ? (
        <StateView error={errorMessage(list.error)} onRetry={() => void list.refetch()} />
      ) : null}
      {list.data && list.data.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.empty}
          refreshControl={
            <RefreshControl
              refreshing={list.isRefetching}
              tintColor={theme.primary}
              onRefresh={() => void list.refetch()}
            />
          }>
          <StateView
            empty="Nenhuma realização neste condomínio."
            emptyIcon={<Waypoints color={theme.textSecondary} size={40} />}
          />
        </ScrollView>
      ) : null}
      {list.data && list.data.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={list.data}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={list.isRefetching}
              tintColor={theme.primary}
              onRefresh={() => void list.refetch()}
            />
          }
          renderItem={({ item }) => (
            <RealizationCard
              item={item}
              onPress={() => router.push({ pathname: '/realizations/[id]', params: { id: item.id } })}
            />
          )}
        />
      ) : null}
      {access.data?.canCreate ? (
        <Fab label="Nova realização" onPress={() => router.push('/realizations/new')} />
      ) : null}
    </Screen>
  )
}

function RealizationCard({ item, onPress }: { item: RealizationItem; onPress: () => void }) {
  const theme = useTheme()

  return (
    <Pressable accessibilityLabel={item.title} accessibilityRole="button" onPress={onPress}>
      <Card style={styles.card}>
        {item.coverImageUrl ? (
          <Image contentFit="cover" source={{ uri: item.coverImageUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholder, { backgroundColor: theme.backgroundElement }]}>
            <ImageOff color={theme.textSecondary} size={28} />
          </View>
        )}
        <View style={styles.copy}>
          <ThemedText type="smallBold">{item.title}</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {formatDay(item.heldIn) ?? 'Sem data'}
          </ThemedText>
        </View>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  list: {
    gap: Spacing.two,
    padding: Spacing.three,
    paddingBottom: 140,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two,
  },
  cover: {
    borderRadius: Radius.control,
    height: 72,
    width: 72,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: Spacing.one,
    justifyContent: 'center',
  },
})
