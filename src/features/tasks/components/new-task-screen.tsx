import { zodResolver } from '@hookform/resolvers/zod'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { TextField } from '@/components/ui/text-field'
import { Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import { createTaskSchema, type CreateTaskValues } from '@/features/tasks/create-task-schema'
import { dueDateForChoice, upcomingDays, type DueChoice } from '@/features/tasks/due-phrase'
import { useTaskActions } from '@/features/tasks/use-task-actions'
import { useTaskFormOptions } from '@/features/tasks/use-task'
import { pickTaskPhoto } from '@/features/tasks/upload-task-photo'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage } from '@/lib/graphql/errors'

const priorities = [
  { value: 'LOW', label: 'Baixa', color: 'primary' },
  { value: 'MEDIUM', label: 'Média', color: 'warning' },
  { value: 'HIGH', label: 'Alta', color: 'danger' },
] as const

const dues: { value: DueChoice; label: string }[] = [
  { value: 'NONE', label: 'Sem prazo' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'TOMORROW', label: 'Amanhã' },
  { value: 'WEEK', label: 'Esta semana' },
  { value: 'PICK', label: 'Escolher data' },
]

export function NewTaskScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { user } = useSession()
  const condo = useSelectedCondo()
  const condoId = condo.selected?.id ?? null
  const options = useTaskFormOptions(user?.id ?? null, condoId)
  const actions = useTaskActions(condoId)
  const [photo, setPhoto] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueChoice: 'NONE',
      pickedDue: null,
      responsibleId: '',
    },
  })
  useEffect(() => {
    const first = options.data?.responsibles[0]
    if (first && !form.getValues('responsibleId')) form.setValue('responsibleId', first.id)
  }, [form, options.data])

  async function choosePhoto(source: 'camera' | 'library') {
    try {
      const picked = await pickTaskPhoto(source)
      if (picked) setPhoto(picked.uri)
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  async function submit(values: CreateTaskValues) {
    setError(null)
    try {
      const created = await actions.create({
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        dueDate: dueDateForChoice(values.dueChoice, values.pickedDue),
        responsibleId: values.responsibleId,
        photoUri: photo ?? undefined,
      })
      router.replace({ pathname: '/tasks/[id]', params: { id: created.id } })
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }

  if (!condo.selected) return <StateView empty="Escolha um condomínio para criar a tarefa." />
  if (options.isPending) return <StateView loading />
  if (options.error) return <StateView error={errorMessage(options.error)} onRetry={() => void options.refetch()} />
  if (options.data && !options.data.canCreate) return <StateView empty="Você não pode criar tarefas." />

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
                label="O que precisa ser feito"
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Ex.: Trocar a lâmpada do hall"
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
                label="Detalhe"
                multiline
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Onde fica e o que aconteceu"
                style={styles.description}
                value={field.value}
              />
            )}
          />
          <ThemedText type="smallBold">Foto, se quiser</ThemedText>
          {photo ? <Image contentFit="cover" source={{ uri: photo }} style={styles.preview} /> : null}
          <Button label="Tirar foto" onPress={() => void choosePhoto('camera')} variant="ghost" />
          <Button label="Escolher da galeria" onPress={() => void choosePhoto('library')} variant="ghost" />
          <ThemedText type="smallBold">Prioridade</ThemedText>
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <View style={styles.choices}>
                {priorities.map((item) => {
                  const selected = field.value === item.value
                  const color = theme[item.color]
                  const textColor = !selected ? color : item.color === 'warning' ? theme.text : theme.onPrimary
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={item.value}
                      onPress={() => field.onChange(item.value)}
                      style={[styles.choice, { backgroundColor: selected ? color : theme.surface, borderColor: color }]}>
                      <ThemedText type="smallBold" style={{ color: textColor }}>
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
            name="dueChoice"
            render={({ field }) => (
              <>
                <ThemedText type="smallBold">Prazo</ThemedText>
                <View style={styles.wrap}>
                  {dues.map((item) => {
                    const selected = field.value === item.value
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        key={item.value}
                        onPress={() => field.onChange(item.value)}
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
                {field.value === 'PICK' ? (
                  <Controller
                    control={form.control}
                    name="pickedDue"
                    render={({ field: picked }) => (
                      <View style={styles.wrap}>
                        {upcomingDays().map((day) => {
                          const selected = picked.value === day.day
                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ selected }}
                              key={day.day}
                              onPress={() => picked.onChange(day.day)}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: selected ? theme.primary : theme.surface,
                                  borderColor: selected ? theme.primary : theme.border,
                                },
                              ]}>
                              <ThemedText type="smallBold" style={{ color: selected ? theme.onPrimary : theme.text }}>
                                {day.label}
                              </ThemedText>
                            </Pressable>
                          )
                        })}
                      </View>
                    )}
                  />
                ) : null}
              </>
            )}
          />
          {form.formState.errors.pickedDue ? (
            <ThemedText themeColor="danger" type="small">
              {form.formState.errors.pickedDue.message}
            </ThemedText>
          ) : null}
          <ThemedText type="smallBold">Quem vai fazer</ThemedText>
          <Controller
            control={form.control}
            name="responsibleId"
            render={({ field }) => (
              <>
                {options.data?.responsibles.map((person) => {
                  const selected = field.value === person.id
                  const label = person.id === user?.id ? 'Eu' : person.name
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={person.id}
                      onPress={() => field.onChange(person.id)}
                      style={[
                        styles.person,
                        {
                          backgroundColor: selected ? theme.primary : theme.surface,
                          borderColor: selected ? theme.primary : theme.border,
                        },
                      ]}>
                      <ThemedText type="smallBold" style={{ color: selected ? theme.onPrimary : theme.text }}>
                        {label}
                      </ThemedText>
                    </Pressable>
                  )
                })}
              </>
            )}
          />
          {form.formState.errors.responsibleId ? (
            <ThemedText themeColor="danger" type="small">
              {form.formState.errors.responsibleId.message}
            </ThemedText>
          ) : null}
          {error ? <Banner message={error} tone="danger" /> : null}
          <Button label="Criar tarefa" loading={actions.busy} onPress={() => void form.handleSubmit(submit)()} />
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
  preview: {
    borderRadius: Radius.control,
    height: 160,
    width: '100%',
  },
  choices: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  choice: {
    alignItems: 'center',
    borderRadius: Radius.control,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
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
  person: {
    borderRadius: Radius.control,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
})
