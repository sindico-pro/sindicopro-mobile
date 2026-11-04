import { useLocalSearchParams, useRouter } from 'expo-router'
import { Camera, MessageSquare, SquareKanban } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, Pressable, RefreshControl, SectionList, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { Fab } from '@/components/ui/fab'
import { FilterChips } from '@/components/ui/filter-chips'
import { Icon } from '@/components/ui/icon'
import { ListRow } from '@/components/ui/list-row'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import type { TaskListItem } from '@/features/tasks/api/tasks-api'
import {
  dueFilterLabel,
  duePhrase,
  priorityView,
  statusLabel,
  taskDue,
  taskStatuses,
  type TaskStatus,
} from '@/features/tasks/due-phrase'
import { useTaskCounts, useTaskList } from '@/features/tasks/use-task-list'
import { useTheme } from '@/hooks/use-theme'
import { errorMessage } from '@/lib/graphql/errors'

const PAGE = 30

export function TasksScreen() {
  const theme = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ due?: string }>()
  const due = taskDue(params.due)
  const { user } = useSession()
  const condo = useSelectedCondo()
  const condoId = condo.selected?.id ?? null
  const personId = user?.id ?? null
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [onlyMine, setOnlyMine] = useState(false)
  const [limit, setLimit] = useState(PAGE)
  const [showDone, setShowDone] = useState(false)
  const counts = useTaskCounts(personId, condoId)
  const locked = counts.data?.mineLocked === true
  const mine = locked ? true : onlyMine
  const list = useTaskList(personId, condoId, locked ? 'TODO' : status, due, mine, limit, !locked || !showDone)
  const doing = useTaskList(personId, condoId, 'IN_PROGRESS', due, true, limit, locked && !showDone)
  const done = useTaskList(personId, condoId, 'DONE', due, true, limit, locked && showDone)
  const canExecute = counts.data?.canExecute ?? false

  function changeStatus(next: TaskStatus) {
    setStatus(next)
    setLimit(PAGE)
  }

  function openTask(id: string, start = false) {
    router.push({ pathname: '/tasks/[id]', params: start ? { id, start: '1' } : { id } })
  }

  function renderTask({ item }: { item: TaskListItem }) {
    return (
      <TaskCard
        canExecute={canExecute}
        item={item}
        onOpen={() => openTask(item.id)}
        onStart={() => openTask(item.id, true)}
      />
    )
  }

  const countFor = (value: TaskStatus) =>
    counts.data ? (value === 'TODO' ? counts.data.todo : value === 'IN_PROGRESS' ? counts.data.doing : counts.data.done) : undefined

  const executorSections = [
    doing.data?.length ? { key: 'doing', title: 'Fazendo agora', data: doing.data } : null,
    list.data?.length ? { key: 'todo', title: 'Para fazer', data: list.data } : null,
  ].filter((section) => section != null)

  const activeError = locked ? (showDone ? done.error : (list.error ?? doing.error)) : list.error
  const activePending = locked ? (showDone ? done.isPending : list.isPending || doing.isPending) : list.isPending
  const refreshing = counts.isRefetching || list.isRefetching || doing.isRefetching || done.isRefetching

  function refresh() {
    void counts.refetch()
    void list.refetch()
    if (locked && !showDone) void doing.refetch()
    if (locked && showDone) void done.refetch()
  }

  const refreshControl = (
    <RefreshControl refreshing={refreshing} tintColor={theme.primary} onRefresh={refresh} />
  )

  return (
    <Screen edges={['left', 'right']}>
      {!locked ? (
        <View style={styles.filter}>
          <FilterChips
            onChange={changeStatus}
            options={taskStatuses.map((value) => ({ value, label: statusLabel(value), count: countFor(value) }))}
            value={status}
          />
        </View>
      ) : null}
      {due ? (
        <Banner actionLabel="Limpar" message={`Mostrando: ${dueFilterLabel(due)}`} onAction={() => router.setParams({ due: '' })} />
      ) : null}
      {!locked && counts.data ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: onlyMine }}
          onPress={() => setOnlyMine((current) => !current)}
          style={[styles.mine, { backgroundColor: onlyMine ? theme.primary : theme.surface, borderColor: onlyMine ? theme.primary : theme.border }]}>
          <ThemedText type="smallBold" style={{ color: onlyMine ? theme.onPrimary : theme.text }}>
            Só minhas
          </ThemedText>
        </Pressable>
      ) : null}
      {condo.loading || (condo.selected && !activeError && (counts.isPending || activePending)) ? <StateView loading /> : null}
      {!condo.loading && condo.error ? <StateView error={condo.error} onRetry={condo.retry} /> : null}
      {!condo.loading && !condo.error && !condo.selected ? (
        <StateView empty="Escolha um condomínio para ver as tarefas." />
      ) : null}
      {condo.selected && activeError ? (
        <StateView error={errorMessage(activeError)} onRetry={refresh} />
      ) : null}
      {locked && showDone ? <Button label="Voltar" onPress={() => setShowDone(false)} variant="ghost" /> : null}
      {locked && showDone && done.data ? (
        <FlatList
          contentContainerStyle={done.data.length === 0 ? styles.empty : styles.list}
          data={done.data}
          style={styles.fill}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <StateView empty="Nenhuma tarefa nesta lista." emptyIcon={<SquareKanban color={theme.textSecondary} size={40} />} />
          }
          ListFooterComponent={
            done.data.length === limit ? (
              <Button label="Ver mais" onPress={() => setLimit((current) => current + PAGE)} variant="ghost" />
            ) : undefined
          }
          refreshControl={refreshControl}
          renderItem={renderTask}
        />
      ) : null}
      {locked && !showDone && list.data && doing.data ? (
        <SectionList
          contentContainerStyle={executorSections.length === 0 ? styles.empty : styles.list}
          style={styles.fill}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <StateView empty="Nada para fazer agora." emptyIcon={<SquareKanban color={theme.textSecondary} size={40} />} />
          }
          ListFooterComponent={
            <View>
              {list.data.length === limit || doing.data.length === limit ? (
                <Button label="Ver mais" onPress={() => setLimit((current) => current + PAGE)} variant="ghost" />
              ) : null}
              <Button
                label={`Ver tarefas feitas (${counts.data?.done ?? 0})`}
                onPress={() => setShowDone(true)}
                variant="ghost"
              />
            </View>
          }
          refreshControl={refreshControl}
          renderItem={renderTask}
          renderSectionHeader={({ section }) => (
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
          )}
          sections={executorSections}
          stickySectionHeadersEnabled={false}
        />
      ) : null}
      {!locked && counts.data && list.data ? (
        <FlatList
          contentContainerStyle={list.data.length === 0 ? styles.empty : styles.list}
          data={list.data}
          style={styles.fill}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <StateView empty="Nenhuma tarefa nesta lista." emptyIcon={<SquareKanban color={theme.textSecondary} size={40} />} />
          }
          ListFooterComponent={
            list.data.length === limit ? (
              <Button label="Ver mais" onPress={() => setLimit((current) => current + PAGE)} variant="ghost" />
            ) : undefined
          }
          refreshControl={refreshControl}
          renderItem={renderTask}
        />
      ) : null}
      {counts.data?.canCreate ? <Fab label="Nova tarefa" onPress={() => router.push('/tasks/new')} /> : null}
    </Screen>
  )
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function TaskCard({
  item,
  canExecute,
  onOpen,
  onStart,
}: {
  item: TaskListItem
  canExecute: boolean
  onOpen: () => void
  onStart: () => void
}) {
  const theme = useTheme()
  const priority = priorityView(item.priority)
  const stripe = priority.tone === 'danger' ? theme.danger : priority.tone === 'warning' ? theme.warning : theme.primary
  const action = item.status === 'TODO' ? 'Começar' : item.status === 'IN_PROGRESS' ? 'Continuar' : null

  return (
    <ListRow
      badge={priority}
      footer={
        canExecute && action ? (
          <Button label={action} onPress={item.status === 'TODO' ? onStart : onOpen} variant="tonal" />
        ) : null
      }
      leading={<View style={[styles.stripe, { backgroundColor: stripe }]} />}
      meta={
        <View style={styles.meta}>
          <ThemedText themeColor={item.isOverdue ? 'danger' : 'textSecondary'} type="small">
            {duePhrase(item.dueDate, item.isOverdue)}
          </ThemedText>
          {item.responsibleName ? (
            <View style={styles.who}>
              <Avatar name={item.responsibleName} size={22} />
              <ThemedText themeColor="textSecondary" type="small">
                {item.responsibleName}
              </ThemedText>
            </View>
          ) : null}
          <View style={styles.who}>
            <Icon color={theme.textSecondary} icon={Camera} size={16} />
            <ThemedText themeColor="textSecondary" type="small">
              {countLabel(item.photoCount, 'foto', 'fotos')}
            </ThemedText>
          </View>
          <View style={styles.who}>
            <Icon color={theme.textSecondary} icon={MessageSquare} size={16} />
            <ThemedText themeColor="textSecondary" type="small">
              {countLabel(item.commentCount, 'comentário', 'comentários')}
            </ThemedText>
          </View>
        </View>
      }
      onPress={onOpen}
      title={item.title}
    />
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  filter: {
    paddingVertical: Spacing.three,
  },
  mine: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  list: {
    paddingBottom: 140,
    paddingTop: Spacing.three,
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 140,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  who: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
  },
  stripe: {
    borderRadius: 3,
    width: 6,
  },
})
