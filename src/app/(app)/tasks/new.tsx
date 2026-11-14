import { Stack } from 'expo-router'

import { NewTaskScreen } from '@/features/tasks/components/new-task-screen'

export default function NewTaskRoute() {
  return (
    <>
      <Stack.Title>Criar tarefa</Stack.Title>
      <Stack.Screen.BackButton>Voltar</Stack.Screen.BackButton>
      <NewTaskScreen />
    </>
  )
}
