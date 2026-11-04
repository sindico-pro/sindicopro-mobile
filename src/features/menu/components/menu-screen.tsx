import * as WebBrowser from 'expo-web-browser'
import { type Href, useRouter } from 'expo-router'
import { Search } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { TextField } from '@/components/ui/text-field'
import { Screen } from '@/components/ui/screen'
import { Radius, Spacing } from '@/constants/theme'
import { useSession } from '@/features/auth/session/session-provider'
import { useSelectedCondo } from '@/features/condo/use-selected-condo'
import { type CatalogEntry } from '@/features/menu/catalog'
import { filterCatalog } from '@/features/menu/filter-catalog'
import { menuIcons } from '@/features/menu/menu-icons'
import { titleCase } from '@/lib/format-name'
import { getWebUrl } from '@/lib/env'
import { useTheme } from '@/hooks/use-theme'

const accountGroups = new Set(['Conta'])

export function MenuScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { user, signOut } = useSession()
  const { selected } = useSelectedCondo()
  const [query, setQuery] = useState('')
  const [leaving, setLeaving] = useState(false)
  const [siteError, setSiteError] = useState<string | null>(null)
  const sections = filterCatalog(selected?.features ?? [], query)
  const modules = sections.filter((section) => !accountGroups.has(section.group))
  const account = sections.filter((section) => accountGroups.has(section.group)).flatMap((section) => section.items)

  async function open(entry: CatalogEntry) {
    setSiteError(null)
    if (entry.action === 'route' && entry.route) {
      router.navigate(entry.route as Href)
      return
    }
    if (entry.action === 'condo') {
      router.navigate('/condo-picker')
      return
    }
    if (entry.action === 'sign-out') {
      setLeaving(true)
      await signOut().finally(() => setLeaving(false))
      return
    }
    const url = getWebUrl()
    if (!url) {
      setSiteError('Configure EXPO_PUBLIC_WEB_URL para abrir o site.')
      return
    }
    const target = entry.path ? `${url.replace(/\/$/, '')}${entry.path}` : url
    await WebBrowser.openBrowserAsync(target)
  }

  return (
    <Screen edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.profile}>
          <Avatar name={user?.name ?? '?'} size={48} />
          <View style={styles.profileText}>
            <ThemedText type="smallBold">{user ? titleCase(user.name) : 'Conta'}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {user?.email}
            </ThemedText>
            {selected ? (
              <ThemedText themeColor="primaryText" type="small">
                {titleCase(selected.name)}
              </ThemedText>
            ) : null}
          </View>
        </Card>
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          label="Buscar"
          leading={<Search color={theme.textSecondary} size={18} />}
          onChangeText={setQuery}
          placeholder="Ocorrência, tarefa, multa…"
          value={query}
        />
        {sections.length === 0 ? <ThemedText themeColor="textSecondary">Nenhum item encontrado.</ThemedText> : null}
        {modules.map((section) => (
          <View key={section.group} style={styles.section}>
            <ThemedText themeColor="textSecondary" type="smallBold">
              {section.group}
            </ThemedText>
            <View style={styles.grid}>
              {section.items.map((entry) => {
                const Glyph = menuIcons[entry.icon]
                return (
                  <Pressable
                    accessibilityLabel={entry.name}
                    accessibilityRole="button"
                    key={entry.id}
                    onPress={() => void open(entry)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.gridItem]}>
                    <Card style={styles.module}>
                      <Glyph color={theme.primary} size={28} />
                      <ThemedText type="smallBold">{entry.name}</ThemedText>
                    </Card>
                  </Pressable>
                )
              })}
            </View>
          </View>
        ))}
        {account.length ? (
          <View style={styles.section}>
            <ThemedText themeColor="textSecondary" type="smallBold">
              Conta
            </ThemedText>
            {account.map((entry) => {
              const Glyph = menuIcons[entry.icon]
              const danger = entry.action === 'sign-out'
              const color = danger ? theme.danger : theme.text
              return (
                <Pressable
                  accessibilityLabel={entry.name}
                  accessibilityRole="button"
                  accessibilityState={{ busy: danger && leaving }}
                  disabled={danger && leaving}
                  key={entry.id}
                  onPress={() => void open(entry)}
                  style={styles.account}>
                  <Glyph color={color} size={20} />
                  <ThemedText style={{ color }}>{danger && leaving ? 'Saindo…' : entry.name}</ThemedText>
                </Pressable>
              )
            })}
          </View>
        ) : null}
        {siteError ? (
          <ThemedText accessibilityLiveRegion="polite" themeColor="danger" type="small">
            {siteError}
          </ThemedText>
        ) : null}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  profileText: {
    flex: 1,
    gap: Spacing.half,
  },
  section: {
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  module: {
    borderRadius: Radius.card,
    gap: Spacing.three,
    minHeight: 112,
    padding: Spacing.three,
  },
  account: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.three,
    minHeight: 44,
  },
})
