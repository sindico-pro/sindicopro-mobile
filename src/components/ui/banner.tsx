import { Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type BannerProps = {
  message: string
  tone?: 'neutral' | 'success' | 'danger'
  actionLabel?: string
  onAction?: () => void
}

export function Banner({ message, tone = 'neutral', actionLabel, onAction }: BannerProps) {
  const theme = useTheme()
  const color = tone === 'success' ? theme.success : tone === 'danger' ? theme.danger : theme.secondary

  return (
    <Pressable
      accessibilityLabel={message}
      accessibilityRole={onAction ? 'button' : 'text'}
      disabled={!onAction}
      onPress={onAction}
      style={[styles.banner, { backgroundColor: `${color}18`, borderColor: color }]}>
      <ThemedText style={styles.message} type="smallBold">
        {message}
      </ThemedText>
      {actionLabel ? (
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          {actionLabel}
        </ThemedText>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  message: {
    flex: 1,
  },
})
