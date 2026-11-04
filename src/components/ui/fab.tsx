import { Plus } from 'lucide-react-native'
import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type FabProps = {
  label: string
  onPress: () => void
}

export function Fab({ label, onPress }: FabProps) {
  const theme = useTheme()

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: theme.secondary, opacity: pressed ? 0.85 : 1 },
      ]}>
      <Icon color={theme.onSecondary} icon={Plus} />
      <ThemedText type="smallBold" style={{ color: theme.onSecondary }}>
        {label}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    bottom: Spacing.four,
    flexDirection: 'row',
    gap: Spacing.two,
    minHeight: 56,
    paddingHorizontal: Spacing.four,
    position: 'absolute',
    right: Spacing.three,
    shadowColor: '#1A1730',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
})
