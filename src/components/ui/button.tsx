import type { LucideIcon } from 'lucide-react-native'
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Icon } from '@/components/ui/icon'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string
  icon?: LucideIcon
  loading?: boolean
  variant?: 'primary' | 'tonal' | 'ghost'
  style?: StyleProp<ViewStyle>
}

export function Button({
  label,
  icon,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const theme = useTheme()
  const isDisabled = disabled || loading
  const backgroundColor =
    variant === 'primary' ? theme.primary : variant === 'tonal' ? theme.primaryMuted : 'transparent'
  const textColor = variant === 'primary' ? theme.onPrimary : variant === 'tonal' ? theme.primaryText : theme.primary

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
      {...rest}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={textColor} /> : null}
        {!loading && icon ? <Icon color={textColor} icon={icon} size={18} /> : null}
        <ThemedText type="smallBold" style={{ color: textColor, flexShrink: 1, textAlign: 'center' }}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  ghost: {
    borderWidth: 0,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
  },
})
