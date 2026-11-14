import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { PhotoGrid } from '@/components/ui/photo-grid'
import { PhotoViewer } from '@/components/ui/photo-viewer'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import type { RealizationDetail } from '@/features/realizations/api/realizations-api'
import { useRealization } from '@/features/realizations/use-realization'
import { formatDay } from '@/lib/format-date'
import { errorMessage } from '@/lib/graphql/errors'

export function RealizationDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>()
  const id = typeof params.id === 'string' ? params.id : null
  const { user } = useSession()
  const realization = useRealization(user?.id ?? null, id)

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Title>{realization.data?.title ?? 'Realização'}</Stack.Title>
      <Stack.Screen.BackButton>Voltar</Stack.Screen.BackButton>
      {realization.isPending ? <StateView loading /> : null}
      {realization.error ? (
        <StateView error={errorMessage(realization.error)} onRetry={() => void realization.refetch()} />
      ) : null}
      {realization.data ? <Detail item={realization.data} /> : null}
    </Screen>
  )
}

function Detail({ item }: { item: RealizationDetail }) {
  const [viewer, setViewer] = useState<string | null>(null)

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText themeColor="textSecondary" type="small">
        {formatDay(item.heldIn) ?? 'Sem data'}
      </ThemedText>
      <ThemedText type="smallBold">Fotos</ThemedText>
      {item.photoUrls.length ? (
        <PhotoGrid photos={item.photoUrls.map((uri) => ({ key: uri, uri, onPress: () => setViewer(uri) }))} />
      ) : (
        <ThemedText themeColor="textSecondary" type="small">
          Sem fotos.
        </ThemedText>
      )}
      {item.beforePhotoUrls.length ? (
        <View style={styles.block}>
          <ThemedText type="smallBold">Antes</ThemedText>
          <PhotoGrid
            photos={item.beforePhotoUrls.map((uri) => ({ key: uri, uri, onPress: () => setViewer(uri) }))}
          />
        </View>
      ) : null}
      <ThemedText type="smallBold">Descrição</ThemedText>
      <ThemedText>{item.description}</ThemedText>
      <PhotoViewer onClose={() => setViewer(null)} uri={viewer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  block: {
    gap: Spacing.two,
  },
})
