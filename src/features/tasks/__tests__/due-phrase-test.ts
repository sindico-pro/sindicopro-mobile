import { createTaskSchema } from '@/features/tasks/create-task-schema'
import { dueDateForChoice, duePhrase, taskDue } from '@/features/tasks/due-phrase'
import { uploadEndpoint } from '@/lib/upload-photo'

const tuesday = new Date('2026-10-27T15:00:00.000Z')

describe('prazo da tarefa', () => {
  it('explica atraso, hoje e amanhã', () => {
    expect(duePhrase(null, false, tuesday)).toBe('Sem prazo')
    expect(duePhrase('2026-10-27T12:00:00.000Z', false, tuesday)).toBe('Vence hoje')
    expect(duePhrase('2026-10-28T12:00:00.000Z', false, tuesday)).toBe('Vence amanhã')
    expect(duePhrase('2026-10-25T12:00:00.000Z', true, tuesday)).toBe('Atrasada há 2 dias')
    expect(duePhrase('2026-10-26T12:00:00.000Z', true, tuesday)).toBe('Atrasada há 1 dia')
  })

  it('monta o prazo em horário de Brasília', () => {
    expect(dueDateForChoice('NONE', null, tuesday)).toBeNull()
    expect(dueDateForChoice('TODAY', null, tuesday)).toBe('2026-10-27T12:00:00.000Z')
    expect(dueDateForChoice('TOMORROW', null, tuesday)).toBe('2026-10-28T12:00:00.000Z')
    expect(dueDateForChoice('WEEK', null, tuesday)).toBe('2026-10-31T12:00:00.000Z')
    expect(dueDateForChoice('PICK', '2026-11-02', tuesday)).toBe('2026-11-02T12:00:00.000Z')
    expect(dueDateForChoice('TODAY', null, new Date('2026-10-28T02:00:00.000Z'))).toBe('2026-10-27T12:00:00.000Z')
  })

  it('ignora filtro de prazo inválido', () => {
    expect(taskDue(undefined)).toBeNull()
    expect(taskDue('HOJE')).toBeNull()
    expect(taskDue('TODAY')).toBe('TODAY')
  })

  it('exige título e dia quando a pessoa escolhe a data', () => {
    const parsed = createTaskSchema.safeParse({
      title: '  ',
      description: '',
      priority: 'MEDIUM',
      dueChoice: 'PICK',
      pickedDue: null,
      responsibleId: 'person-1',
    })
    expect(parsed.success).toBe(false)
  })

  it('aponta o upload para a mesma origem do GraphQL', () => {
    expect(uploadEndpoint('http://10.0.2.2:7400/graphql', 'user 1')).toBe(
      'http://10.0.2.2:7400/upload/user%201',
    )
  })
})
