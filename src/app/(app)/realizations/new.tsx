import { Stack } from 'expo-router'

import { NewRealizationScreen } from '@/features/realizations/components/new-realization-screen'

export default function NewRealizationRoute() {
  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', title: 'Nova realização' }} />
      <NewRealizationScreen />
    </>
  )
}
