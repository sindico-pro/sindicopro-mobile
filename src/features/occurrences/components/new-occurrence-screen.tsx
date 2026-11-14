import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'

import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { DateTimeField } from '@/components/ui/date-time-field'
import { PhotoPicker } from '@/components/ui/photo-picker'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { TextField } from '@/components/ui/text-field'
import { Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import {
  createOccurrenceSchema,
  type CreateOccurrenceValues,
} from '@/features/occurrences/create-occurrence-schema'
import { useOccurrenceAccess } from '@/features/occurrences/use-occurrence'
import { useOccurrenceActions } from '@/features/occurrences/use-occurrence-actions'
import { errorMessage } from '@/lib/graphql/errors'
import { combineLocal, dateFromLocal, endOfLocalDay, localDay, localTime } from '@/lib/local-date'

export function NewOccurrenceScreen() {
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
          <Controller
            control={form.control}
            name="day"
            render={({ field, fieldState }) => (
              <DateTimeField
                error={fieldState.error?.message}
                label="Quando aconteceu"
                maximumDate={endOfLocalDay()}
                mode="date"
                onChange={(date) => field.onChange(localDay(date))}
                value={dateFromLocal(field.value, form.getValues('time'))}
              />
            )}
          />
          <Controller
            control={form.control}
            name="time"
            render={({ field, fieldState }) => (
              <DateTimeField
                error={fieldState.error?.message}
                label="Horário"
                mode="time"
                onChange={(date) => field.onChange(localTime(date))}
                value={dateFromLocal(form.getValues('day'), field.value)}
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
})
