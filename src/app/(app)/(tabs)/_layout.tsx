import { Tabs } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { BookMarked, House, LayoutGrid, SquareKanban } from 'lucide-react-native'
import { Platform, Pressable, StyleSheet, type PressableProps } from 'react-native'

import { AppHeader } from '@/components/ui/app-header'
import { Fonts } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

function HapticTab(props: PressableProps) {
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        if (Platform.OS === 'ios') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        props.onPress?.(event)
      }}
    />
  )
}

export default function TabsLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarButton: HapticTab,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="occurrences"
        options={{
          title: 'Ocorrências',
          tabBarIcon: ({ color, size }) => <BookMarked color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, size }) => <SquareKanban color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
})
