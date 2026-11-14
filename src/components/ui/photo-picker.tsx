import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { PhotoGrid } from '@/components/ui/photo-grid'
import { PhotoViewer } from '@/components/ui/photo-viewer'
import { Spacing } from '@/constants/theme'
import { errorMessage } from '@/lib/graphql/errors'
import { pickPhoto } from '@/lib/upload-photo'

type PhotoPickerProps = {
  label: string
  uris: string[]
  onChange: (uris: string[]) => void
}

export function PhotoPicker({ label, uris, onChange }: PhotoPickerProps) {
  const [error, setError] = useState<string | null>(null)
  const [viewer, setViewer] = useState<string | null>(null)

  async function add(source: 'camera' | 'library') {
    try {
      const picked = await pickPhoto(source)
      if (picked) onChange([...uris, picked.uri])
      setError(null)
    } catch (caught) {
      const message = errorMessage(caught)
      setError(source === 'camera' && !message.includes('Permita o uso da câmera') ? 'Câmera indisponível. Escolha da galeria.' : message)
    }
  }

  return (
    <View style={styles.block}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {uris.length ? (
        <PhotoGrid
          photos={uris.map((uri, index) => ({
            key: `${uri}-${index}`,
            uri,
            onPress: () => setViewer(uri),
            onRemove: () => onChange(uris.filter((_, item) => item !== index)),
          }))}
        />
      ) : null}
      <Button label="Tirar foto" onPress={() => void add('camera')} variant="ghost" />
      <Button label="Escolher da galeria" onPress={() => void add('library')} variant="ghost" />
      {error ? <Banner message={error} tone="danger" /> : null}
      <PhotoViewer onClose={() => setViewer(null)} uri={viewer} />
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.two,
  },
})
