import { Stack } from 'expo-router'
import { Platform } from 'react-native'

import { CondoProvider } from '@/features/condo/condo-provider'
import { useTheme } from '@/hooks/use-theme'

export default function AppLayout() {
  const theme = useTheme()

  return (
    <CondoProvider>
      <Stack
        screenOptions={{
          headerBackTitle: 'Voltar',
          headerBackTitleStyle: { fontSize: 17 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.primary,
          headerTitleStyle: { color: theme.text },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Voltar' }} />
        <Stack.Screen
          name="condo-picker"
          options={{
            headerShown: false,
            presentation: Platform.OS === 'web' ? 'modal' : 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetCornerRadius: 24,
            sheetGrabberVisible: true,
            contentStyle: { backgroundColor: theme.surface },
          }}
        />
        <Stack.Screen name="realizations/index" options={{ title: 'Realizações' }} />
        <Stack.Screen name="realizations/new" options={{ title: 'Criar Realização' }} />
        <Stack.Screen name="realizations/[id]" options={{ title: 'Realização' }} />
        <Stack.Screen name="occurrences/new" options={{ title: 'Criar ocorrência' }} />
        <Stack.Screen name="occurrences/[id]" options={{ title: 'Ocorrência' }} />
        <Stack.Screen name="tasks/new" options={{ title: 'Criar tarefa' }} />
        <Stack.Screen name="tasks/[id]" options={{ title: 'Tarefa' }} />
      </Stack>
    </CondoProvider>
  )
}
