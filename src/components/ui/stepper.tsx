import { Check } from 'lucide-react-native'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type StepperProps = {
  steps: string[]
  current: number
}

export function Stepper({ steps, current }: StepperProps) {
  const theme = useTheme()
  const span = Math.max(steps.length - 1, 1)
  const fill = Math.min(Math.max(current, 0), span) / span
  const inset = `${50 / Math.max(steps.length, 1)}%` as const

  return (
    <View style={styles.row}>
      <View pointerEvents="none" style={[styles.track, { backgroundColor: theme.border, left: inset, right: inset }]}>
        <View style={[styles.fill, { backgroundColor: theme.primary, width: `${fill * 100}%` }]} />
      </View>
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        const color = done || active ? theme.primary : theme.border
        return (
          <View key={step} style={styles.step}>
            <View style={[styles.dot, { backgroundColor: done || active ? theme.primary : theme.surface, borderColor: color }]}>
              {done ? <Check color={theme.onPrimary} size={16} /> : (
                <ThemedText type="smallBold" style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
                  {index + 1}
                </ThemedText>
              )}
            </View>
            <ThemedText type="smallBold" style={{ color: active || done ? theme.text : theme.textSecondary, textAlign: 'center' }}>
              {step}
            </ThemedText>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  track: {
    borderRadius: Radius.pill,
    height: 2,
    overflow: 'hidden',
    position: 'absolute',
    top: 17,
  },
  fill: {
    height: 2,
  },
  step: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  dot: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
    zIndex: 1,
  },
})
