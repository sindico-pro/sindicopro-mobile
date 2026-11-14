import { Stack } from 'expo-router'

import { NewOccurrenceScreen } from '@/features/occurrences/components/new-occurrence-screen'

export default function NewOccurrenceRoute() {
  return (
    <>
      <Stack.Title>Criar ocorrência</Stack.Title>
      <Stack.Screen.BackButton>Voltar</Stack.Screen.BackButton>
      <NewOccurrenceScreen />
    </>
  )
}
