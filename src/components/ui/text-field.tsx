import { Eye, EyeOff } from 'lucide-react-native'
import { useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Fonts, Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type TextFieldProps = TextInputProps & {
  label: string
  ref?: ComponentPropsWithRef<typeof TextInput>['ref']
  error?: string
  secureToggle?: boolean
  leading?: ReactNode
}

export function TextField({ label, error, secureToggle = false, leading, style, ...rest }: TextFieldProps) {
  const theme = useTheme()
  const [visible, setVisible] = useState(false)
  const secure = secureToggle && !visible

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}
      >
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secure}
          style={[styles.input, leading ? styles.inputWithLeading : null, { color: theme.text }, style]}
          {...rest}
        />
        {secureToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setVisible((current) => !current)}
            hitSlop={8}
            style={styles.toggle}
          >
            {visible ? (
              <EyeOff color={theme.textSecondary} size={18} />
            ) : (
              <Eye color={theme.textSecondary} size={18} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText accessibilityLiveRegion="polite" type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  inputRow: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.control,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    width: 0,
    fontFamily: Fonts.medium,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  inputWithLeading: {
    paddingLeft: Spacing.two,
  },
  toggle: {
    minHeight: 52,
    justifyContent: 'center',
    paddingRight: Spacing.three,
  },
  leading: {
    paddingLeft: Spacing.three,
  },
})
