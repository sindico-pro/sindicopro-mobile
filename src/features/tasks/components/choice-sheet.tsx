import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Fonts, Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ChoiceSheetProps = {
  visible: boolean
  title: string
  primaryLabel: string
  secondaryLabel: string
  loading?: boolean
  onPrimary: () => void
  onSecondary: () => void
  onClose: () => void
  children?: ReactNode
}

export function ChoiceSheet({
  visible,
  title,
  primaryLabel,
  secondaryLabel,
  loading = false,
  onPrimary,
  onSecondary,
  onClose,
  children,
}: ChoiceSheetProps) {
  const theme = useTheme()

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Fechar" onPress={onClose} style={styles.backdrop} />
      <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {children}
        <Button label={primaryLabel} loading={loading} onPress={onPrimary} />
        <Button disabled={loading} label={secondaryLabel} onPress={onSecondary} variant="ghost" />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#00000066',
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    gap: Spacing.three,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
  },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 22,
    lineHeight: 28,
  },
})
