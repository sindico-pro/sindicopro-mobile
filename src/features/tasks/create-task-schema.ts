import { z } from 'zod'

import { dueChoices } from './due-phrase'

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Escreva o que precisa ser feito').max(180, 'Título muito longo'),
    description: z.string().trim().max(4000, 'Descrição muito longa'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    dueChoice: z.enum(dueChoices),
    pickedDue: z.string().nullable(),
    responsibleId: z.string().min(1, 'Escolha quem vai fazer'),
  })
  .superRefine((value, context) => {
    if (value.dueChoice === 'PICK' && !value.pickedDue) {
      context.addIssue({ code: 'custom', path: ['pickedDue'], message: 'Escolha o dia' })
    }
  })

export type CreateTaskValues = z.infer<typeof createTaskSchema>
