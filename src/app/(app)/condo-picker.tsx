import { useRouter } from 'expo-router'
import { CheckCircle2 } from 'lucide-react-native'
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { StateView } from '@/components/ui/state-view'
import { Radius, Spacing } from '@/constants/theme'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import { titleCase } from '@/lib/format-name'
import { useTheme } from '@/hooks/use-theme'

export default function CondoPickerRoute() {
  const theme = useTheme()
  const router = useRouter()
  const { condos, selected, loading, error, retry, select } = useSelectedCondo()

  const rows = condos.map((condo) => {
    const current = condo.id === selected?.id
    const name = titleCase(condo.name)
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: current }}
        key={condo.id}
        onPress={() => {
          void select(condo.id).then((saved) => {
            if (saved) router.back()
          })
        }}
        style={[
          styles.row,
          {
            backgroundColor: current ? `${theme.primary}10` : theme.surface,
            borderColor: current ? theme.primary : theme.border,
          },
        ]}>
        <Avatar name={name} size={44} />
        <ThemedText style={styles.name} type="smallBold">
          {name}
        </ThemedText>
        {current ? <CheckCircle2 color={theme.primary} size={22} /> : null}
      </Pressable>
    )
  })

  return (
    <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Trocar condomínio</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          Selecione o condomínio que deseja acessar agora.
        </ThemedText>
      </View>
      {loading ? <StateView loading /> : null}
      {error ? <StateView error={error} onRetry={retry} /> : null}
      {!loading && !error && condos.length === 0 ? <StateView empty="Nenhum condomínio disponível." /> : null}
      {Platform.OS === 'web' ? <ScrollView style={styles.webList}>{rows}</ScrollView> : rows}
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.cancel}>
        <ThemedText style={{ color: theme.primaryText }} type="smallBold">
          Cancelar
        </ThemedText>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
  webList: {
    maxHeight: 420,
  },
  row: {
    alignItems: 'center',
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  name: {
    flex: 1,
  },
  cancel: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
})
