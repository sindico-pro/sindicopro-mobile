import { Stack } from 'expo-router'

import { NewOccurrenceScreen } from '@/features/occurrences/components/new-occurrence-screen'

export default function NewOccurrenceRoute() {
  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', title: 'Nova ocorrência' }} />
      <NewOccurrenceScreen />
    </>
  )
}
