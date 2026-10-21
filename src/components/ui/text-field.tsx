import { useState } from 'react'
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Fonts, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type TextFieldProps = TextInputProps & {
  label: string
  error?: string
  secureToggle?: boolean
}

export function TextField({ label, error, secureToggle = false, style, ...rest }: TextFieldProps) {
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
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.danger : theme.backgroundSelected,
          },
        ]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secure}
          style={[styles.input, { color: theme.text }, style]}
          {...rest}
        />
        {secureToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setVisible((current) => !current)}
            hitSlop={8}
            style={styles.toggle}>
            <ThemedText type="small" themeColor="primary">
              {visible ? 'Ocultar' : 'Mostrar'}
            </ThemedText>
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
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  toggle: {
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: Spacing.three,
  },
})
