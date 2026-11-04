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
      </Stack>
    </CondoProvider>
  )
}
