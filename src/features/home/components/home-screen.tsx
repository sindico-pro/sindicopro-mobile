import { Image } from 'expo-image'
import { type Href, useRouter } from 'expo-router'
import {
  AlarmClock,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Flag,
  ImageOff,
  ListCheck,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { StateView } from '@/components/ui/state-view'
import { Fonts, Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import { useHome } from '@/features/home/use-home'
import { formatWhen } from '@/lib/format-date'
import { errorMessage } from '@/lib/graphql/errors'
import { useTheme } from '@/hooks/use-theme'

type SummaryCard = {
  label: string
  count: number
  href: Href
  icon: LucideIcon
  color: string
}

export function HomeScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { user } = useSession()
  const condo = useSelectedCondo()
  const home = useHome(user?.id ?? null, condo.selected?.id ?? null)
  const data = home.data

  const occurrenceCards: SummaryCard[] = data?.occurrences
    ? [
        { label: 'Abertas', count: data.occurrences.open, href: '/occurrences?filter=OPEN', icon: XCircle, color: theme.danger },
        { label: 'Sem resposta', count: data.occurrences.withoutResponse, href: '/occurrences?filter=WITHOUT_RESPONSE', icon: Flag, color: theme.danger },
        { label: 'Aguardando síndico', count: data.occurrences.pendingManager, href: '/occurrences?filter=PENDING_MANAGER', icon: Flag, color: theme.warning },
        { label: 'Encerradas', count: data.occurrences.closed, href: '/occurrences?filter=CLOSED', icon: ListCheck, color: theme.primary },
      ]
    : []
  const taskCards: SummaryCard[] = data?.tasks
    ? [
        { label: 'Atrasadas', count: data.tasks.overdue, href: '/tasks?due=OVERDUE', icon: AlarmClock, color: theme.danger },
        { label: 'Hoje', count: data.tasks.dueToday, href: '/tasks?due=TODAY', icon: CalendarCheck, color: theme.warning },
        { label: 'Amanhã', count: data.tasks.dueTomorrow, href: '/tasks?due=TOMORROW', icon: CalendarClock, color: theme.primary },
      ]
    : []

  return (
    <Screen edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={home.isRefetching}
            tintColor={theme.primary}
            onRefresh={() => {
              condo.retry()
              void home.refetch()
            }}
          />
        }>
        {condo.loading || (condo.selected && home.isPending) ? <HomeSkeleton /> : null}
        {!condo.loading && condo.error ? <StateView error={condo.error} onRetry={condo.retry} /> : null}
        {!condo.loading && !condo.error && !condo.selected ? (
          <View style={styles.empty}>
            <StateView empty="Escolha um condomínio para ver o início." />
            <Button label="Escolher condomínio" onPress={() => router.navigate('/condo-picker')} />
          </View>
        ) : null}
        {condo.selected && home.error ? (
          <StateView error={errorMessage(home.error)} onRetry={() => void home.refetch()} />
        ) : null}
        {data ? (
          <View style={styles.sections}>
            {occurrenceCards.length ? (
              <Section title="Ocorrências">
                <View style={styles.grid}>
                  {occurrenceCards.map((card) => (
                    <SummaryTile key={card.label} card={card} group="Ocorrências" wide />
                  ))}
                </View>
              </Section>
            ) : null}
            {taskCards.length ? (
              <Section title="Tarefas">
                <View style={styles.taskRow}>
                  {taskCards.map((card) => (
                    <SummaryTile key={card.label} card={card} group="Tarefas" />
                  ))}
                </View>
              </Section>
            ) : null}
            {data.recentRealizations ? (
              <Section
                action={{ label: 'Ver todas', onPress: () => router.navigate('/realizations') }}
                title="Últimas realizações">
                {data.recentRealizations.length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
                    {data.recentRealizations.map((item) => (
                      <Pressable
                        accessibilityLabel={item.title}
                        accessibilityRole="button"
                        key={item.id}
                        onPress={() => router.navigate({ pathname: '/realizations/[id]', params: { id: item.id } })}>
                        <Card style={styles.realization}>
                          {item.coverImageUrl ? (
                            <Image source={{ uri: item.coverImageUrl }} style={styles.cover} />
                          ) : (
                            <View style={[styles.cover, styles.placeholder, { backgroundColor: theme.backgroundElement }]}>
                              <ImageOff color={theme.textSecondary} size={28} />
                            </View>
                          )}
                          <ThemedText type="smallBold">{item.title}</ThemedText>
                          <ThemedText themeColor="textSecondary" type="small">
                            {formatWhen(item.heldIn) ?? 'Sem data'}
                          </ThemedText>
                        </Card>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <ThemedText themeColor="textSecondary" type="small">
                    Nenhuma realização recente.
                  </ThemedText>
                )}
              </Section>
            ) : null}
            {!data.occurrences && !data.tasks && !data.recentRealizations ? (
              <StateView empty="Nada disponível para o seu acesso neste condomínio." />
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  )
}

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: { label: string; onPress: () => void }
  children: ReactNode
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {action ? (
          <Pressable accessibilityRole="button" onPress={action.onPress}>
            <ThemedText type="smallBold" themeColor="primary">
              {action.label}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  )
}

function SummaryTile({ card, group, wide = false }: { card: SummaryCard; group: string; wide?: boolean }) {
  const router = useRouter()
  const Glyph = card.icon

  return (
    <Pressable
      accessibilityLabel={`${group} ${card.label}, ${card.count}`}
      accessibilityRole="button"
      onPress={() => router.navigate(card.href)}
      style={wide ? styles.wide : styles.tile}>
      <Card style={styles.summary}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryMetric}>
            <Glyph color={card.color} size={22} />
            <ThemedText style={[styles.count, { color: card.color }]}>{card.count}</ThemedText>
          </View>
          <ChevronRight color={card.color} size={16} />
        </View>
        <ThemedText type="small">{card.label}</ThemedText>
      </Card>
    </Pressable>
  )
}

function HomeSkeleton() {
  const theme = useTheme()
  return (
    <View accessibilityRole="progressbar" style={styles.sections} testID="loading">
      <View style={[styles.bone, styles.boneTitle, { backgroundColor: theme.backgroundElement }]} />
      <View style={styles.grid}>
        <View style={[styles.bone, styles.boneCard, { backgroundColor: theme.backgroundElement }]} />
        <View style={[styles.bone, styles.boneCard, { backgroundColor: theme.backgroundElement }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: Spacing.four,
    padding: Spacing.four,
  },
  empty: {
    gap: Spacing.two,
  },
  sections: {
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  taskRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  wide: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  tile: {
    flex: 1,
  },
  summary: {
    gap: Spacing.one,
    padding: 12,
  },
  summaryTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
    justifyContent: 'space-between',
  },
  summaryMetric: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: Spacing.two,
  },
  count: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 26,
  },
  carousel: {
    gap: Spacing.two,
  },
  realization: {
    gap: Spacing.one,
    padding: Spacing.two,
    width: 200,
  },
  cover: {
    borderRadius: Radius.control,
    height: 112,
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bone: {
    borderRadius: Radius.card,
  },
  boneTitle: {
    height: 16,
    width: 140,
  },
  boneCard: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 74,
  },
})
