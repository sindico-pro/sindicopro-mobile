import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type Chip<T extends string> = {
  value: T
  label: string
  count?: number
}

type FilterChipsProps<T extends string> = {
  options: Chip<T>[]
  value: T
  onChange: (value: T) => void
}

export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
  const theme = useTheme()

  return (
    <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
      {options.map((option) => {
        const selected = option.value === value
        const label = option.count == null ? option.label : `${option.label}, ${option.count}`
        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? theme.primary : theme.surface,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}>
            <ThemedText type="smallBold" style={{ color: selected ? theme.onPrimary : theme.text }}>
              {option.label}
            </ThemedText>
            {option.count == null ? null : (
              <View style={[styles.count, { backgroundColor: selected ? `${theme.onPrimary}22` : theme.backgroundElement }]}>
                <ThemedText type="smallBold" style={{ color: selected ? theme.onPrimary : theme.textSecondary }}>
                  {option.count}
                </ThemedText>
              </View>
            )}
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chip: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  count: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    minWidth: 22,
    paddingHorizontal: Spacing.one,
  },
})
