import { Stack } from 'expo-router'

import { NewRealizationScreen } from '@/features/realizations/components/new-realization-screen'

export default function NewRealizationRoute() {
  return (
    <>
      <Stack.Title>Criar Realização</Stack.Title>
      <Stack.Screen.BackButton>Voltar</Stack.Screen.BackButton>
      <NewRealizationScreen />
    </>
  )
}
