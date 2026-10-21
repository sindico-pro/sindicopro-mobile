import {
  MavenPro_400Regular,
  MavenPro_500Medium,
  MavenPro_600SemiBold,
  MavenPro_700Bold,
} from '@expo-google-fonts/maven-pro'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'

import { SessionProvider, useSession } from '@/features/auth/session/session-provider'
import { bindQueryLifecycle, queryClient } from '@/lib/query/query-client'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  )
}

function RootNavigator() {
  const colorScheme = useColorScheme()
  const { status } = useSession()
  const [fontsLoaded, fontError] = useFonts({
    MavenPro_400Regular,
    MavenPro_500Medium,
    MavenPro_600SemiBold,
    MavenPro_700Bold,
  })

  useEffect(() => {
    bindQueryLifecycle()
  }, [])

  const ready = (fontsLoaded || fontError != null) && status !== 'restoring'

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync()
    }
  }, [ready])

  if (!ready) return null

  const signedIn = status === 'signedIn'
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: '#20AD96',
      background: colorScheme === 'dark' ? '#121318' : '#ffffff',
      card: colorScheme === 'dark' ? '#121318' : '#ffffff',
      text: colorScheme === 'dark' ? '#ffffff' : '#1C1B22',
      border: colorScheme === 'dark' ? '#21232A' : '#F3F4F6',
    },
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={signedIn} redirectTo="/sign-in">
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  )
}
