import { useRouter } from 'expo-router'
import { Building2, ChevronDown } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Fonts, Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import { firstName, titleCase } from '@/lib/format-name'
import { useTheme } from '@/hooks/use-theme'

export function AppHeader() {
  const theme = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useSession()
  const { selected, loading, error } = useSelectedCondo()
  const greeting = `Olá, ${firstName(user?.name ?? '')}`
  const condoLabel = error
    ? 'Condomínios indisponíveis'
    : loading
      ? 'Carregando…'
      : selected
        ? titleCase(selected.name)
        : 'Escolher condomínio'

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
          paddingTop: insets.top + Spacing.one,
        },
      ]}>
      <View style={styles.top}>
        <ThemedText accessibilityRole="header" style={styles.greeting}>
          {greeting}
        </ThemedText>
        <Pressable accessibilityLabel="Abrir menu" accessibilityRole="button" onPress={() => router.navigate('/menu')}>
          <Avatar name={user?.name ?? '?'} />
        </Pressable>
      </View>
      <Pressable
        accessibilityLabel={condoLabel}
        accessibilityRole="button"
        onPress={() => router.navigate('/condo-picker')}
        style={[styles.pill, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
        <Building2 color={theme.primary} size={18} />
        <View style={styles.pillText}>
          <ThemedText numberOfLines={1} type="smallBold">
            {condoLabel}
          </ThemedText>
          <ThemedText style={styles.hint} themeColor="textSecondary">
            Trocar condomínio
          </ThemedText>
        </View>
        <ChevronDown color={theme.textSecondary} size={16} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  greeting: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    maxWidth: '100%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pillText: {
    flexShrink: 1,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
})
