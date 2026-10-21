import { ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Screen } from '@/components/ui/screen'
import { useSession } from '@/features/auth/session/session-provider'
import { Spacing } from '@/constants/theme'

export function DashboardScreen() {
  const { user } = useSession()
  if (!user) return null
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <ThemedText accessibilityRole="header" type="subtitle">
            Olá, {user.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary">Bem-vindo ao Síndico Pro.</ThemedText>
        </View>
        <ThemedView style={styles.account} type="backgroundElement">
          <ThemedText type="smallBold">Sua conta</ThemedText>
          <ThemedText>{user.name}</ThemedText>
          <ThemedText themeColor="textSecondary">{user.email}</ThemedText>
        </ThemedView>
      </ScrollView>
    </Screen>
  )
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: Spacing.four, gap: Spacing.four },
  heading: { gap: Spacing.two },
  account: { padding: Spacing.four, gap: Spacing.two, borderRadius: Spacing.three },
})
