import { Check } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Animated, Modal, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Fonts } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type SuccessMarkProps = {
  visible: boolean
  message: string
  onDone: () => void
}

export function SuccessMark({ visible, message, onDone }: SuccessMarkProps) {
  const theme = useTheme()
  const [scale] = useState(() => new Animated.Value(0.6))
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (!visible) return
    scale.setValue(0.6)
    const animation = Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 })
    animation.start()
    const timer = setTimeout(() => onDoneRef.current(), 1400)
    return () => {
      animation.stop()
      clearTimeout(timer)
    }
  }, [scale, visible])

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Animated.View style={[styles.screen, { backgroundColor: theme.primary, transform: [{ scale }] }]}>
        <Check color={theme.onPrimary} size={72} strokeWidth={3} />
        <ThemedText style={[styles.message, { color: theme.onPrimary }]}>{message}</ThemedText>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  message: {
    fontFamily: Fonts.semibold,
    fontSize: 28,
    lineHeight: 34,
  },
})
