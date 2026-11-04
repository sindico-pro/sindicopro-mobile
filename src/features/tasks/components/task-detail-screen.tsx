import * as Haptics from 'expo-haptics'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { Stepper } from '@/components/ui/stepper'
import { Fonts, Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import type { PhotoKind, TaskDetail } from '@/features/tasks/api/tasks-api'
import { ChoiceSheet } from '@/features/tasks/components/choice-sheet'
import { PhotoViewer } from '@/features/tasks/components/photo-viewer'
import { SuccessMark } from '@/features/tasks/components/success-mark'
import { duePhrase, priorityView, taskStatuses, statusLabel, type TaskStatus } from '@/features/tasks/due-phrase'
import { PhotoSection, WorkSteps } from '@/features/tasks/components/work-steps'
import { useTaskActions } from '@/features/tasks/use-task-actions'
import { photoPickMessage, usePhotoUpload } from '@/features/tasks/use-photo-upload'
import { useTask } from '@/features/tasks/use-task'
import { pickTaskPhoto } from '@/features/tasks/upload-task-photo'
import { formatWhen } from '@/lib/format-date'
import { errorMessage } from '@/lib/graphql/errors'
import { useTheme } from '@/hooks/use-theme'

const steps = taskStatuses.map(statusLabel)

export function TaskDetailScreen() {
  const theme = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ id?: string; start?: string }>()
  const id = typeof params.id === 'string' ? params.id : null
  const startFlag = params.start === '1'
  const { user } = useSession()
  const condo = useSelectedCondo()
  const task = useTask(user?.id ?? null, id)
  const actions = useTaskActions(condo.selected?.id ?? null)
  const photos = usePhotoUpload(condo.selected?.id ?? null, id)
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'danger' } | null>(null)
  const [manualStart, setManualStart] = useState(false)
  const [declinedStart, setDeclinedStart] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const [finishComment, setFinishComment] = useState('')
  const [viewer, setViewer] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const asked = useRef(false)
  const startTask = useRef(actions.start)

  useEffect(() => {
    startTask.current = actions.start
  }, [actions.start])

  async function run(action: () => Promise<unknown>, done?: string) {
    try {
      await action()
      if (done) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setNotice({ message: done, tone: 'success' })
      }
    } catch (error) {
      setNotice({ message: errorMessage(error), tone: 'danger' })
    }
  }

  const promptStart =
    task.data?.canExecute === true &&
    task.data.status === 'TODO' &&
    task.data.beforePhotoUrls.length === 0 &&
    ((startFlag && !declinedStart) || manualStart)

  function closeStartPrompt() {
    setManualStart(false)
    setDeclinedStart(true)
    if (startFlag) router.setParams({ start: '' })
  }

  function askStart() {
    if ((task.data?.beforePhotoUrls.length ?? 0) === 0) setManualStart(true)
    else void run(() => actions.start({ id: id as string }), 'Tarefa em andamento')
  }

  useEffect(() => {
    if (!startFlag || asked.current || !task.data || !id) return
    if (!task.data.canExecute || task.data.status !== 'TODO' || task.data.beforePhotoUrls.length === 0) return
    asked.current = true
    router.setParams({ start: '' })
    void startTask.current({ id }).then(
      () => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setNotice({ message: 'Tarefa em andamento', tone: 'success' })
      },
      (error: unknown) => setNotice({ message: errorMessage(error), tone: 'danger' }),
    )
  }, [id, router, startFlag, task.data])

  async function startWithPhoto(takePhoto: boolean) {
    if (!id) return
    let photoUri: string | undefined
    if (takePhoto) {
      try {
        const picked = await pickTaskPhoto('camera')
        if (!picked) return
        photoUri = picked.uri
      } catch (error) {
        closeStartPrompt()
        setNotice({ message: photoPickMessage('camera', error), tone: 'danger' })
        return
      }
    }
    closeStartPrompt()
    await run(() => actions.start({ id, photoUri }), 'Tarefa em andamento')
  }

  async function finish(takePhoto: boolean) {
    if (!id) return
    let photoUri: string | undefined
    if (takePhoto) {
      try {
        const picked = await pickTaskPhoto('camera')
        if (!picked) return
        photoUri = picked.uri
      } catch (error) {
        setFinishOpen(false)
        setNotice({ message: photoPickMessage('camera', error), tone: 'danger' })
        return
      }
    }
    setFinishOpen(false)
    try {
      await actions.conclude({ id, comment: finishComment, photoUri })
      setFinishComment('')
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setSuccess(true)
    } catch (error) {
      setNotice({ message: errorMessage(error), tone: 'danger' })
    }
  }

  async function addPhoto(kind: PhotoKind, source: 'camera' | 'library') {
    const message = await photos.pick(kind, source)
    if (message) setNotice({ message, tone: 'danger' })
  }

  function removePhoto(url: string) {
    if (!id) return
    Alert.alert('Remover foto', 'Esta foto sai da tarefa.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => void run(() => actions.removePhoto.mutateAsync({ id, url })),
      },
    ])
  }

  const current = task.data ? taskStatuses.indexOf(task.data.status) : 0
  const working = task.data?.status === 'IN_PROGRESS' && task.data.canExecute

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerBackTitle: 'Voltar', title: task.data?.title ?? 'Tarefa' }} />
      {task.isPending ? <StateView loading /> : null}
      {task.error ? <StateView error={errorMessage(task.error)} onRetry={() => void task.refetch()} /> : null}
      {task.data ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content}>
            {notice ? (
              <ThemedText themeColor={notice.tone === 'success' ? 'success' : 'danger'} type="small">
                {notice.message}
              </ThemedText>
            ) : null}
            {working ? null : <Stepper current={current} steps={steps} />}
            <Card style={styles.summary}>
              <View style={styles.row}>
                <Badge label={priorityView(task.data.priority).label} tone={priorityView(task.data.priority).tone} />
                <ThemedText themeColor={task.data.isOverdue ? 'danger' : 'textSecondary'} type="smallBold">
                  {duePhrase(task.data.dueDate, task.data.isOverdue)}
                </ThemedText>
              </View>
              {working || !task.data.description ? null : <ThemedText>{task.data.description}</ThemedText>}
              {task.data.responsibleName ? (
                <View style={styles.row}>
                  <Avatar name={task.data.responsibleName} size={36} />
                  <ThemedText>{task.data.responsibleName}</ThemedText>
                </View>
              ) : null}
              {task.data.occurrenceTitle ? (
                <ThemedText themeColor="textSecondary">Ocorrência: {task.data.occurrenceTitle}</ThemedText>
              ) : null}
            </Card>
            {working ? (
              <WorkSteps
                afterJobs={photos.jobs.filter((job) => job.kind === 'AFTER')}
                afterUrls={task.data.afterPhotoUrls}
                beforeJobs={photos.jobs.filter((job) => job.kind === 'BEFORE')}
                beforeUrls={task.data.beforePhotoUrls}
                description={task.data.description}
                onCamera={(kind) => void addPhoto(kind, 'camera')}
                onLibrary={(kind) => void addPhoto(kind, 'library')}
                onOpen={setViewer}
                onRemove={removePhoto}
                onRetry={(job) => void photos.retry(job)}
              />
            ) : (
              <>
                <PhotoSection
                  canChange={task.data.canExecute}
                  jobs={photos.jobs.filter((job) => job.kind === 'BEFORE')}
                  onCamera={() => void addPhoto('BEFORE', 'camera')}
                  onLibrary={() => void addPhoto('BEFORE', 'library')}
                  onOpen={setViewer}
                  onRemove={removePhoto}
                  onRetry={(job) => void photos.retry(job)}
                  title="Fotos de antes"
                  urls={task.data.beforePhotoUrls}
                />
                {task.data.status === 'TODO' ? null : (
                  <PhotoSection
                    canChange={task.data.canExecute}
                    jobs={photos.jobs.filter((job) => job.kind === 'AFTER')}
                    onCamera={() => void addPhoto('AFTER', 'camera')}
                    onLibrary={() => void addPhoto('AFTER', 'library')}
                    onOpen={setViewer}
                    onRemove={removePhoto}
                    onRetry={(job) => void photos.retry(job)}
                    title="Fotos de depois"
                    urls={task.data.afterPhotoUrls}
                  />
                )}
              </>
            )}
            <Card style={styles.summary}>
              <ThemedText type="smallBold">O que aconteceu</ThemedText>
              <Timeline task={task.data} />
            </Card>
          </ScrollView>
          {task.data.canExecute ? (
            <View style={[styles.bar, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.commentRow}>
                <TextInput
                  accessibilityLabel="Comentário"
                  onChangeText={setComment}
                  placeholder="Escreva um comentário"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.comment, { color: theme.text, borderColor: theme.border }]}
                  value={comment}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={!comment.trim() || actions.comment.isPending}
                  onPress={() => {
                    const text = comment.trim()
                    if (!id || !text) return
                    void run(async () => {
                      await actions.comment.mutateAsync({ id, content: text })
                      setComment('')
                    }, 'Comentário enviado')
                  }}
                  style={styles.send}>
                  <ThemedText type="smallBold" style={{ color: theme.primary }}>
                    Enviar
                  </ThemedText>
                </Pressable>
              </View>
              <Button
                label={actionLabel(task.data.status)}
                loading={actions.busy || actions.move.isPending}
                onPress={() => {
                  if (!id) return
                  if (task.data?.status === 'TODO') askStart()
                  else if (task.data?.status === 'IN_PROGRESS') {
                    setFinishComment('')
                    setFinishOpen(true)
                  } else void run(() => actions.move.mutateAsync({ id, status: 'IN_PROGRESS' }), 'Tarefa reaberta')
                }}
              />
            </View>
          ) : null}
        </KeyboardAvoidingView>
      ) : null}
      <ChoiceSheet
        loading={actions.busy}
        onClose={closeStartPrompt}
        onPrimary={() => void startWithPhoto(true)}
        onSecondary={() => void startWithPhoto(false)}
        primaryLabel="Tirar foto de antes"
        secondaryLabel="Continuar sem foto"
        title="Quer uma foto de antes?"
        visible={promptStart}
      />
      <ChoiceSheet
        loading={actions.busy}
        onClose={() => setFinishOpen(false)}
        onPrimary={() => void finish(true)}
        onSecondary={() => void finish(false)}
        primaryLabel="Tirar foto"
        secondaryLabel="Concluir sem foto"
        title="Quer tirar uma foto de como ficou?"
        visible={finishOpen}>
        <TextInput
          accessibilityLabel="Comentário da conclusão"
          multiline
          onChangeText={setFinishComment}
          placeholder="Comentário, se quiser"
          placeholderTextColor={theme.textSecondary}
          style={[styles.finishComment, { color: theme.text, borderColor: theme.border }]}
          value={finishComment}
        />
      </ChoiceSheet>
      <PhotoViewer onClose={() => setViewer(null)} uri={viewer} />
      <SuccessMark
        message="Tarefa concluída"
        onDone={() => {
          setSuccess(false)
          router.back()
        }}
        visible={success}
      />
    </Screen>
  )
}

function actionLabel(status: TaskStatus) {
  if (status === 'TODO') return 'Começar tarefa'
  if (status === 'IN_PROGRESS') return 'Concluir tarefa'
  return 'Reabrir'
}

function Timeline({ task }: { task: TaskDetail }) {
  const theme = useTheme()
  const events = [
    task.startedAt
      ? { id: 'started', at: task.startedAt, title: `Iniciada por ${task.startedByName ?? 'alguém'}`, body: null }
      : null,
    task.completedAt
      ? { id: 'done', at: task.completedAt, title: `Concluída por ${task.completedByName ?? 'alguém'}`, body: null }
      : null,
    ...task.comments.map((item) => ({
      id: item.id,
      at: item.createdAt,
      title: item.authorName,
      body: item.content,
    })),
  ]
    .filter((item) => item != null)
    .sort((left, right) => left.at.localeCompare(right.at))

  if (events.length === 0) {
    return <ThemedText themeColor="textSecondary">Nenhum comentário ainda.</ThemedText>
  }

  return (
    <View style={styles.timeline}>
      {events.map((event) => (
        <View key={event.id} style={[styles.event, { borderColor: theme.border }]}>
          <ThemedText type="smallBold">{event.title}</ThemedText>
          {event.body ? <ThemedText>{event.body}</ThemedText> : null}
          <ThemedText themeColor="textSecondary" type="small">
            {formatWhen(event.at)}
          </ThemedText>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    gap: Spacing.three,
    padding: Spacing.three,
    paddingBottom: Spacing.four,
  },
  summary: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  timeline: {
    gap: Spacing.two,
  },
  event: {
    borderLeftWidth: 3,
    gap: Spacing.one,
    paddingLeft: Spacing.three,
  },
  bar: {
    borderTopWidth: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  commentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  comment: {
    borderRadius: Radius.control,
    borderWidth: 1,
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
  send: {
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.two,
  },
  finishComment: {
    borderRadius: Radius.control,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 72,
    padding: Spacing.three,
    textAlignVertical: 'top',
  },
})
