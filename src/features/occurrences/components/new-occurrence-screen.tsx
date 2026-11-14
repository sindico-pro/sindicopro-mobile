import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { PhotoPicker } from '@/components/ui/photo-picker'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { TextField } from '@/components/ui/text-field'
import { Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import {
  createOccurrenceSchema,
  type CreateOccurrenceValues,
} from '@/features/occurrences/create-occurrence-schema'
import { useOccurrenceAccess } from '@/features/occurrences/use-occurrence'
import { useOccurrenceActions } from '@/features/occurrences/use-occurrence-actions'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage } from '@/lib/graphql/errors'
import { combineLocal, localDay, localTime, recentDays } from '@/lib/local-date'

export function NewOccurrenceScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { user } = useSession()
  const condo = useSelectedCondo()
  const condoId = condo.selected?.id ?? null
  const access = useOccurrenceAccess(user?.id ?? null, condoId)
  const actions = useOccurrenceActions(condoId)
  const [photos, setPhotos] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const now = new Date()
  const form = useForm<CreateOccurrenceValues>({
    resolver: zodResolver(createOccurrenceSchema),
    defaultValues: { title: '', description: '', day: localDay(now), time: localTime(now) },
  })

  async function submit(values: CreateOccurrenceValues) {
    const when = combineLocal(values.day, values.time)
    if (!when) {
      setError('Informe um dia e horário válidos')
      return
    }
    setError(null)
    try {
      const created = await actions.create({
        title: values.title,
        description: values.description,
        occurredAt: when.toISOString(),
        photoUris: photos,
      })
      router.replace({ pathname: '/occurrences/[id]', params: { id: created.id } })
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  if (!condo.selected) return <StateView empty="Escolha um condomínio para abrir a ocorrência." />
  if (access.isPending) return <StateView loading />
  if (access.error) return <StateView error={errorMessage(access.error)} onRetry={() => void access.refetch()} />
  if (access.data && !access.data.canCreate) return <StateView empty="Você não pode criar ocorrências." />

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <TextField
                error={fieldState.error?.message}
                label="Título"
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Ex.: Portão da garagem"
                value={field.value}
              />
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <TextField
                error={fieldState.error?.message}
                label="Descrição"
                multiline
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="O que aconteceu"
                style={styles.description}
                value={field.value}
              />
            )}
          />
          <ThemedText type="smallBold">Quando aconteceu</ThemedText>
          <Controller
            control={form.control}
            name="day"
            render={({ field }) => (
              <View style={styles.wrap}>
                {recentDays(7).map((item) => {
                  const selected = field.value === item.day
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={item.day}
                      onPress={() => field.onChange(item.day)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? theme.primary : theme.surface,
                          borderColor: selected ? theme.primary : theme.border,
                        },
                      ]}>
                      <ThemedText type="smallBold" style={{ color: selected ? theme.onPrimary : theme.text }}>
                        {item.label}
                      </ThemedText>
                    </Pressable>
                  )
                })}
              </View>
            )}
          />
          <Controller
            control={form.control}
            name="time"
            render={({ field, fieldState }) => (
              <TextField
                error={fieldState.error?.message}
                keyboardType="numbers-and-punctuation"
                label="Horário"
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="14:30"
                value={field.value}
              />
            )}
          />
          <PhotoPicker label="Fotos, se quiser" onChange={setPhotos} uris={photos} />
          {error ? <Banner message={error} tone="danger" /> : null}
          <Button label="Abrir ocorrência" loading={actions.busy} onPress={() => void form.handleSubmit(submit)()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    gap: Spacing.three,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  description: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
})
