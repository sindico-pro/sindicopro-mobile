import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { DateTimeField } from '@/components/ui/date-time-field'
import { PhotoPicker } from '@/components/ui/photo-picker'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { TextField } from '@/components/ui/text-field'
import { Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import {
  createRealizationSchema,
  type CreateRealizationValues,
} from '@/features/realizations/create-realization-schema'
import { useCreateRealization } from '@/features/realizations/use-create-realization'
import { useRealizationAccess } from '@/features/realizations/use-realization'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage } from '@/lib/graphql/errors'
import { combineLocal, dateFromLocal, endOfLocalDay, localDay } from '@/lib/local-date'

export function NewRealizationScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { user } = useSession()
  const condo = useSelectedCondo()
  const condoId = condo.selected?.id ?? null
  const access = useRealizationAccess(user?.id ?? null, condoId)
  const actions = useCreateRealization(condoId)
  const [photos, setPhotos] = useState<string[]>([])
  const [beforePhotos, setBeforePhotos] = useState<string[]>([])
  const [showBefore, setShowBefore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<CreateRealizationValues>({
    resolver: zodResolver(createRealizationSchema),
    defaultValues: { title: '', description: '', day: localDay() },
  })

  async function submit(values: CreateRealizationValues) {
    if (photos.length === 0) {
      setError('Adicione pelo menos uma foto da realização.')
      return
    }
    if (showBefore && beforePhotos.length === 0) {
      setError('Adicione pelo menos uma foto do antes ou desligue a opção.')
      return
    }
    const heldIn = combineLocal(values.day, '12:00')
    if (!heldIn) {
      setError('Escolha a data')
      return
    }
    setError(null)
    try {
      const created = await actions.create({
        title: values.title,
        description: values.description,
        heldIn: heldIn.toISOString(),
        photoUris: photos,
        beforePhotoUris: showBefore ? beforePhotos : [],
      })
      router.replace({ pathname: '/realizations/[id]', params: { id: created.id } })
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  if (!condo.selected) return <StateView empty="Escolha um condomínio para registrar a realização." />
  if (access.isPending) return <StateView loading />
  if (access.error) return <StateView error={errorMessage(access.error)} onRetry={() => void access.refetch()} />
  if (access.data && !access.data.canCreate) return <StateView empty="Você não pode criar realizações." />

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
                placeholder="Ex.: Reparo do telhado"
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
                label="Data"
                maximumDate={endOfLocalDay()}
                mode="date"
                onChange={(date) => field.onChange(localDay(date))}
                value={dateFromLocal(field.value)}
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
                placeholder="Descreva o que foi feito"
                style={styles.description}
                value={field.value}
              />
            )}
          />
          <PhotoPicker label="Fotos da realização" onChange={setPhotos} uris={photos} />
          <View style={[styles.before, { borderColor: theme.border }]}>
            <View style={styles.beforeCopy}>
              <ThemedText type="smallBold">Mostrar como estava antes</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                Opcional. Use quando o antes ajuda a evidenciar a conquista.
              </ThemedText>
            </View>
            <Switch
              accessibilityLabel="Mostrar como estava antes"
              onValueChange={setShowBefore}
              value={showBefore}
            />
          </View>
          {showBefore ? <PhotoPicker label="Fotos do antes" onChange={setBeforePhotos} uris={beforePhotos} /> : null}
          {error ? <Banner message={error} tone="danger" /> : null}
          <Button label="Cadastrar" loading={actions.busy} onPress={() => void form.handleSubmit(submit)()} />
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
  before: {
    alignItems: 'center',
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  beforeCopy: {
    flex: 1,
    gap: Spacing.one,
  },
})
