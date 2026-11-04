import { Stack } from 'expo-router'

import { NewTaskScreen } from '@/features/tasks/components/new-task-screen'

export default function NewTaskRoute() {
  return (
    <>
      <Stack.Screen options={{ presentation: 'modal', title: 'Nova tarefa' }} />
      <NewTaskScreen />
    </>
  )
}
