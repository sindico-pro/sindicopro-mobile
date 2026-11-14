import { z } from 'zod'

export const createOccurrenceSchema = z.object({
  title: z.string().trim().min(1, 'Título obrigatório').max(180, 'Título muito longo'),
  description: z.string().trim().min(4, 'Descrição obrigatória').max(4000, 'Descrição muito longa'),
  day: z.string().min(1, 'Escolha o dia'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe o horário, como 14:30'),
})

export type CreateOccurrenceValues = z.infer<typeof createOccurrenceSchema>
