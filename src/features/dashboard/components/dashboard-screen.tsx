import { FlatList, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { StateView } from '@/components/ui/state-view'
import { profileLabel, canSeeCondos } from '@/features/auth/access-policy'
import { useSession } from '@/features/auth/session/session-provider'
import { useAccessibleCondos, type CondoSummary } from '@/features/dashboard/hooks/use-accessible-condos'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { AppError } from '@/lib/graphql/errors'

function condoErrorMessage(error: unknown) {
  if (error instanceof AppError && (error.type === 'network' || error.type === 'timeout')) {
    return error.message
  }
  if (error instanceof AppError && error.message) return error.message
  return 'Não foi possível carregar os condomínios.'
}

export function DashboardScreen() {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { user, isOffline } = useSession()
  const condos = useAccessibleCondos(user)
  const visible = user ? canSeeCondos(user) : false

  if (!user) return null

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {isOffline ? (
        <ThemedText accessibilityLiveRegion="polite" style={styles.banner} themeColor="secondary">
          Sem conexão. Mostrando os dados salvos da sua sessão.
        </ThemedText>
      ) : null}
      <FlatList
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.four }]}
        data={visible ? (condos.data ?? []) : []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          visible ? (
            <StateView
              empty={condos.isSuccess ? 'Nenhum condomínio encontrado.' : null}
              error={condos.isError ? condoErrorMessage(condos.error) : null}
              loading={condos.isLoading}
              onRetry={() => {
                void condos.refetch()
              }}
            />
          ) : (
            <ThemedText themeColor="textSecondary">
              Seu acesso ao painel ainda não foi liberado.
            </ThemedText>
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText accessibilityRole="header" type="subtitle">
              Olá, {user.name}
            </ThemedText>
            <ThemedText themeColor="textSecondary">{user.email}</ThemedText>
            <ThemedText type="smallBold" themeColor="primary">
              {profileLabel(user)}
            </ThemedText>
            {visible ? (
              <ThemedText type="smallBold" style={styles.section}>
                Seus condomínios
              </ThemedText>
            ) : null}
          </View>
        }
        onRefresh={() => {
          if (visible) void condos.refetch()
        }}
        refreshing={visible && condos.isRefetching && !condos.isLoading}
        renderItem={({ item }) => <CondoCard condo={item} />}
      />
    </View>
  )
}

function CondoCard({ condo }: { condo: CondoSummary }) {
  return (
    <ThemedView
      accessibilityLabel={`${condo.name}. Documento ${condo.document}. Telefone ${condo.phone}.`}
      style={styles.card}
      type="backgroundElement">
      <ThemedText type="smallBold">{condo.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {condo.document}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {condo.phone}
      </ThemedText>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  banner: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  list: {
    flexGrow: 1,
    gap: Spacing.two,
    padding: Spacing.four,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  section: {
    marginTop: Spacing.four,
  },
  card: {
    borderRadius: Spacing.three,
    gap: Spacing.half,
    padding: Spacing.three,
  },
})
