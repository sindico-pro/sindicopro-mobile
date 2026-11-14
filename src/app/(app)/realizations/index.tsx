import { Stack } from 'expo-router'

import { RealizationsScreen } from '@/features/realizations/components/realizations-screen'

export default function RealizationsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Realizações' }} />
      <RealizationsScreen />
    </>
  )
}
