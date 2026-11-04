import { Camera, Check, Image as Gallery } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PhotoGrid, type PhotoTile } from '@/components/ui/photo-grid'
import { Radius, Spacing } from '@/constants/theme'
import type { PhotoKind } from '@/features/tasks/api/tasks-api'
import type { PhotoJob } from '@/features/tasks/use-photo-upload'
import { useTheme } from '@/hooks/use-theme'

type PhotoSectionProps = {
  title?: string
  urls: string[]
  jobs: PhotoJob[]
  canChange: boolean
  onCamera: () => void
  onLibrary: () => void
  onOpen: (uri: string) => void
  onRemove: (url: string) => void
  onRetry: (job: PhotoJob) => void
}

export function PhotoSection({
  title,
  urls,
  jobs,
  canChange,
  onCamera,
  onLibrary,
  onOpen,
  onRemove,
  onRetry,
}: PhotoSectionProps) {
  const tiles: PhotoTile[] = [
    ...urls.map((url) => ({
      key: url,
      uri: url,
      onPress: () => onOpen(url),
      onRemove: canChange ? () => onRemove(url) : undefined,
    })),
    ...jobs.map((job) => ({
      key: job.id,
      uri: job.localUri,
      progress: job.status === 'uploading' ? job.progress : undefined,
      failed: job.status === 'failed',
      onRetry: job.status === 'failed' ? () => onRetry(job) : undefined,
    })),
  ]

  return (
    <Card style={styles.section}>
      {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
      {tiles.length > 0 ? <PhotoGrid photos={tiles} /> : null}
      {canChange ? (
        <View style={styles.photoActions}>
          <Button icon={Camera} label="Tirar foto" onPress={onCamera} style={styles.photoButton} variant="tonal" />
          <Button icon={Gallery} label="Escolher da galeria" onPress={onLibrary} style={styles.photoButton} variant="ghost" />
        </View>
      ) : null}
    </Card>
  )
}

type WorkStepsProps = {
  description: string
  beforeUrls: string[]
  afterUrls: string[]
  beforeJobs: PhotoJob[]
  afterJobs: PhotoJob[]
  onCamera: (kind: PhotoKind) => void
  onLibrary: (kind: PhotoKind) => void
  onOpen: (uri: string) => void
  onRemove: (url: string) => void
  onRetry: (job: PhotoJob) => void
}

export function WorkSteps({
  description,
  beforeUrls,
  afterUrls,
  beforeJobs,
  afterJobs,
  onCamera,
  onLibrary,
  onOpen,
  onRemove,
  onRetry,
}: WorkStepsProps) {
  return (
    <View style={styles.steps}>
      <Step done={beforeUrls.length > 0} index={1} title="Foto de antes">
        <PhotoSection
          canChange
          jobs={beforeJobs}
          onCamera={() => onCamera('BEFORE')}
          onLibrary={() => onLibrary('BEFORE')}
          onOpen={onOpen}
          onRemove={onRemove}
          onRetry={onRetry}
          urls={beforeUrls}
        />
      </Step>
      <Step done={false} index={2} title="Faça o serviço">
        <Card style={styles.section}>
          {description ? <ThemedText>{description}</ThemedText> : null}
          <ThemedText themeColor="textSecondary">Se precisar avisar algo, escreva abaixo</ThemedText>
        </Card>
      </Step>
      <Step done={afterUrls.length > 0} index={3} last title="Foto de como ficou">
        <PhotoSection
          canChange
          jobs={afterJobs}
          onCamera={() => onCamera('AFTER')}
          onLibrary={() => onLibrary('AFTER')}
          onOpen={onOpen}
          onRemove={onRemove}
          onRetry={onRetry}
          urls={afterUrls}
        />
      </Step>
    </View>
  )
}

function Step({
  index,
  title,
  done,
  last = false,
  children,
}: {
  index: number
  title: string
  done: boolean
  last?: boolean
  children: ReactNode
}) {
  const theme = useTheme()

  return (
    <View style={styles.step}>
      <View style={styles.rail}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: done ? theme.primary : theme.surface,
              borderColor: done ? theme.primary : theme.border,
            },
          ]}>
          {done ? (
            <Check color={theme.onPrimary} size={16} />
          ) : (
            <ThemedText type="smallBold">{index}</ThemedText>
          )}
        </View>
        {last ? null : <View style={[styles.line, { backgroundColor: done ? theme.primary : theme.border }]} />}
      </View>
      <View style={[styles.stepMain, last ? styles.stepMainLast : null]}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  steps: {
    gap: 0,
  },
  step: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rail: {
    alignItems: 'center',
    width: 36,
  },
  badge: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
    zIndex: 1,
  },
  line: {
    flex: 1,
    marginTop: Spacing.two,
    width: 2,
  },
  stepMain: {
    flex: 1,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  stepMainLast: {
    paddingBottom: 0,
  },
  section: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  photoActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  photoButton: {
    flex: 1,
    paddingHorizontal: Spacing.two,
  },
})
