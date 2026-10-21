import { Stack } from 'expo-router'

import { SignOutButton } from '@/features/auth/components/sign-out-button'
import { useTheme } from '@/hooks/use-theme'

export default function AppLayout() {
  const theme = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.text },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Painel',
          headerRight: () => <SignOutButton />,
        }}
      />
    </Stack>
  )
}
