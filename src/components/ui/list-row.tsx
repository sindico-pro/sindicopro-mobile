import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Spacing } from '@/constants/theme'

type ListRowProps = {
  title: string
  subtitle?: string | null
  badge?: { label: string; tone: BadgeTone }
  meta?: ReactNode
  leading?: ReactNode
  footer?: ReactNode
  onPress?: () => void
}

export function ListRow({ title, subtitle, badge, meta, leading, footer, onPress }: ListRowProps) {
  const body = (
    <View style={styles.main}>
      {leading}
      <View style={styles.body}>
        <View style={styles.top}>
          <ThemedText style={styles.title} type="smallBold">
            {title}
          </ThemedText>
          {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
        </View>
        {subtitle ? (
          <ThemedText themeColor="textSecondary" type="small">
            {subtitle}
          </ThemedText>
        ) : null}
        {meta}
      </View>
    </View>
  )

  return (
    <Card style={styles.card}>
      {onPress ? (
        <Pressable accessibilityLabel={title} accessibilityRole="button" onPress={onPress}>
          {body}
        </Pressable>
      ) : (
        body
      )}
      {footer}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    padding: Spacing.three,
  },
  main: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  body: {
    flex: 1,
    gap: Spacing.two,
  },
  top: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
})
