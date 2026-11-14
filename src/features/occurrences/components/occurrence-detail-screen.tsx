import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PhotoGrid } from '@/components/ui/photo-grid'
import { PhotoPicker } from '@/components/ui/photo-picker'
import { PhotoViewer } from '@/components/ui/photo-viewer'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { TextField } from '@/components/ui/text-field'
import { Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import type { OccurrenceDetail } from '@/features/occurrences/api/occurrences-api'
import { useOccurrenceActions } from '@/features/occurrences/use-occurrence-actions'
import { useOccurrence } from '@/features/occurrences/use-occurrence'
import { formatWhen } from '@/lib/format-date'
import { errorMessage } from '@/lib/graphql/errors'

const statusBadge: Record<string, { label: string; tone: BadgeTone }> = {
  OPEN: { label: 'Aberta', tone: 'danger' },
  CLOSED: { label: 'Encerrada', tone: 'success' },
  FROZEN: { label: 'Congelada', tone: 'neutral' },
}

function isImage(url: string) {
  return /\.(jpe?g|png|gif|webp|heic)(\?|$)/i.test(url)
}

export function OccurrenceDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>()
  const id = typeof params.id === 'string' ? params.id : null
  const { user } = useSession()
  const condo = useSelectedCondo()
  const occurrence = useOccurrence(user?.id ?? null, id)
  const actions = useOccurrenceActions(condo.selected?.id ?? null)

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Title>{occurrence.data?.title ?? 'Ocorrência'}</Stack.Title>
      <Stack.Screen.BackButton>Voltar</Stack.Screen.BackButton>
      {occurrence.isPending ? <StateView loading /> : null}
      {occurrence.error ? (
        <StateView error={errorMessage(occurrence.error)} onRetry={() => void occurrence.refetch()} />
      ) : null}
      {occurrence.data && id ? (
        <OccurrenceBody
          busy={actions.respond.isPending || actions.close.isPending}
          item={occurrence.data}
          onClose={async () => {
            await actions.close.mutateAsync(id)
          }}
          onRespond={async (content, photoUris) => {
            await actions.respond.mutateAsync({ id, content, photoUris })
          }}
        />
      ) : null}
    </Screen>
  )
}

function OccurrenceBody({
  item,
  busy,
  onRespond,
  onClose,
}: {
  item: OccurrenceDetail
  busy: boolean
  onRespond: (content: string, photoUris: string[]) => Promise<void>
  onClose: () => Promise<void>
}) {
  const badge = statusBadge[item.status] ?? { label: item.status, tone: 'neutral' as const }
  const images = item.fileUrls.filter(isImage)
  const files = item.fileUrls.filter((url) => !isImage(url))
  const [viewer, setViewer] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  function confirmClose() {
    Alert.alert('Encerrar ocorrência?', 'Quem registrou recebe um aviso por e-mail.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Encerrar',
        style: 'destructive',
        onPress: () => {
          setError(null)
          void onClose().catch((caught) => setError(errorMessage(caught)))
        },
      },
    ])
  }

  async function send() {
    const text = content.trim()
    if (!text) {
      setError('Escreva uma resposta')
      return
    }
    setError(null)
    try {
      await onRespond(text, photos)
      setContent('')
      setPhotos([])
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Badge label={badge.label} tone={badge.tone} />
          <ThemedText themeColor="textSecondary" type="small">
            {item.authorName}
            {formatWhen(item.occurredAt) ? ` · ${formatWhen(item.occurredAt)}` : ''}
          </ThemedText>
        </View>
        <ThemedText>{item.description}</ThemedText>
        {images.length ? (
          <PhotoGrid photos={images.map((uri) => ({ key: uri, uri, onPress: () => setViewer(uri) }))} />
        ) : null}
        {files.map((url) => (
          <Button key={url} label="Abrir anexo" onPress={() => void Linking.openURL(url)} variant="ghost" />
        ))}
        <ThemedText type="smallBold">Respostas</ThemedText>
        {item.responses.length === 0 ? (
          <ThemedText themeColor="textSecondary" type="small">
            Nenhuma resposta ainda.
          </ThemedText>
        ) : (
          item.responses.map((response) => (
            <Card key={response.id} style={styles.response}>
              <View style={styles.header}>
                <ThemedText type="smallBold">{response.authorName}</ThemedText>
                {response.fromManager ? <Badge label="Síndico" tone="neutral" /> : null}
              </View>
              <ThemedText>{response.content}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {formatWhen(response.createdAt)}
              </ThemedText>
              {response.fileUrls.filter(isImage).length ? (
                <PhotoGrid
                  photos={response.fileUrls.filter(isImage).map((uri) => ({
                    key: uri,
                    uri,
                    onPress: () => setViewer(uri),
                  }))}
                />
              ) : null}
            </Card>
          ))
        )}
        {item.status === 'FROZEN' ? (
          <ThemedText themeColor="textSecondary" type="small">
            Ocorrência congelada. As respostas continuam liberadas.
          </ThemedText>
        ) : null}
        {item.status === 'CLOSED' ? (
          <ThemedText themeColor="textSecondary" type="small">
            Esta ocorrência já foi encerrada.
          </ThemedText>
        ) : null}
        {item.canRespond ? (
          <View style={styles.reply}>
            <TextField
              label="Resposta"
              multiline
              onChangeText={setContent}
              placeholder="Escreva a resposta"
              style={styles.replyInput}
              value={content}
            />
            <PhotoPicker label="Fotos da resposta" onChange={setPhotos} uris={photos} />
            <Button label="Enviar resposta" loading={busy} onPress={() => void send()} />
          </View>
        ) : null}
        {error ? <Banner message={error} tone="danger" /> : null}
        {item.canClose ? <Button label="Encerrar" onPress={confirmClose} variant="tonal" /> : null}
      </ScrollView>
      <PhotoViewer onClose={() => setViewer(null)} uri={viewer} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    gap: Spacing.three,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  response: {
    gap: Spacing.one,
    padding: Spacing.three,
  },
  reply: {
    gap: Spacing.two,
  },
  replyInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
})
