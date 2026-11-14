import ExpoDateTimePicker from '@expo/ui/community/datetime-picker'
import { createElement, useState } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Fonts, Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { combineLocal, localDay, localTime } from '@/lib/local-date'

type DateTimeMode = 'date' | 'time'

type DateTimeFieldProps = {
  label: string
  mode: DateTimeMode
  value: Date
  onChange: (value: Date) => void
  maximumDate?: Date
  minimumDate?: Date
  error?: string
}

function formatValue(mode: DateTimeMode, value: Date) {
  if (mode === 'time') {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(value)
  }
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(value)
}

function fromInput(mode: DateTimeMode, raw: string, current: Date) {
  if (mode === 'date') return combineLocal(raw, localTime(current))
  return combineLocal(localDay(current), raw)
}

export function DateTimeField({
  label,
  mode,
  value,
  onChange,
  maximumDate,
  minimumDate,
  error,
}: DateTimeFieldProps) {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const borderColor = error ? theme.danger : theme.border

  function apply(date: Date) {
    onChange(date)
    setOpen(false)
  }

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {Platform.OS === 'ios' ? (
        <View style={[styles.box, { backgroundColor: theme.surface, borderColor }]}>
          <ExpoDateTimePicker
            accentColor={theme.primary}
            display="compact"
            locale="pt_BR"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            mode={mode}
            onValueChange={(_event, date) => onChange(date)}
            style={styles.picker}
            value={value}
          />
        </View>
      ) : Platform.OS === 'web' ? (
        <View style={[styles.box, { backgroundColor: theme.surface, borderColor }]}>
          {createElement('input', {
            'aria-label': label,
            max: maximumDate && mode === 'date' ? localDay(maximumDate) : undefined,
            min: minimumDate && mode === 'date' ? localDay(minimumDate) : undefined,
            onChange: (event: { target: { value: string } }) => {
              const next = fromInput(mode, event.target.value, value)
              if (next) onChange(next)
            },
            style: {
              background: 'transparent',
              border: 'none',
              color: theme.text,
              fontFamily: Fonts.medium,
              fontSize: 16,
              outline: 'none',
              width: '100%',
            },
            type: mode === 'date' ? 'date' : 'time',
            value: mode === 'date' ? localDay(value) : localTime(value),
          })}
        </View>
      ) : (
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={[styles.box, { backgroundColor: theme.surface, borderColor }]}>
          <ThemedText>{formatValue(mode, value)}</ThemedText>
        </Pressable>
      )}
      {Platform.OS === 'android' && open ? (
        <ExpoDateTimePicker
          accentColor={theme.primary}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          mode={mode}
          negativeButton={{ label: 'Cancelar' }}
          onDismiss={() => setOpen(false)}
          onValueChange={(_event, date) => apply(date)}
          positiveButton={{ label: 'OK' }}
          presentation="dialog"
          value={value}
        />
      ) : null}
      {error ? (
        <ThemedText accessibilityLiveRegion="polite" themeColor="danger" type="small">
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
  box: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radius.control,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  picker: {
    alignSelf: 'flex-start',
  },
})
