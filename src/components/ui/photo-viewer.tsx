import { Image } from 'expo-image'
import { Modal, Pressable, StyleSheet } from 'react-native'

import { ThemedText } from '@/components/themed-text'

type PhotoViewerProps = {
  uri: string | null
  onClose: () => void
}

export function PhotoViewer({ uri, onClose }: PhotoViewerProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} visible={uri != null}>
      <Pressable accessibilityLabel="Fechar foto" onPress={onClose} style={styles.screen}>
        {uri ? <Image contentFit="contain" source={{ uri }} style={styles.image} /> : null}
        <ThemedText type="smallBold" style={styles.close}>
          Fechar
        </ThemedText>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    flex: 1,
  },
  close: {
    color: '#FFFFFF',
    padding: 24,
    textAlign: 'center',
  },
})
