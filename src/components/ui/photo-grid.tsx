import { Image } from 'expo-image'
import { X } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export type PhotoTile = {
  key: string
  uri: string
  progress?: number
  failed?: boolean
  onPress?: () => void
  onRemove?: () => void
  onRetry?: () => void
}

type PhotoGridProps = {
  photos: PhotoTile[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const theme = useTheme()

  return (
    <View style={styles.grid}>
      {photos.map((photo) => (
        <View key={photo.key} style={styles.tile}>
          <Pressable accessibilityLabel="Abrir foto" accessibilityRole="button" onPress={photo.onPress} style={styles.imageButton}>
            <Image contentFit="cover" source={{ uri: photo.uri }} style={styles.image} />
            {photo.progress != null && photo.progress < 1 ? (
              <View style={styles.progress}>
                <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
                  {`${Math.round(photo.progress * 100)}%`}
                </ThemedText>
              </View>
            ) : null}
          </Pressable>
          {photo.failed && photo.onRetry ? (
            <Pressable accessibilityLabel="Tentar enviar de novo" accessibilityRole="button" onPress={photo.onRetry} style={styles.retry}>
              <ThemedText type="smallBold" style={{ color: theme.danger }}>
                Tentar de novo
              </ThemedText>
            </Pressable>
          ) : null}
          {photo.onRemove ? (
            <Pressable
              accessibilityLabel="Remover foto"
              accessibilityRole="button"
              hitSlop={8}
              onPress={photo.onRemove}
              style={[styles.remove, { backgroundColor: theme.surface }]}>
              <X color={theme.text} size={18} />
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tile: {
    width: 112,
  },
  imageButton: {
    borderRadius: Radius.control,
    height: 112,
    overflow: 'hidden',
    width: 112,
  },
  image: {
    height: 112,
    width: 112,
  },
  progress: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: '#00000088',
    justifyContent: 'center',
  },
  retry: {
    minHeight: 48,
    justifyContent: 'center',
  },
  remove: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 32,
  },
})
