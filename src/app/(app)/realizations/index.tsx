import { Stack } from 'expo-router'

import { RealizationsScreen } from '@/features/realizations/components/realizations-screen'

export default function RealizationsRoute() {
  return (
    <>
      <Stack.Title>Realizações</Stack.Title>
      <Stack.Screen.BackButton>Voltar</Stack.Screen.BackButton>
      <RealizationsScreen />
    </>
  )
}
