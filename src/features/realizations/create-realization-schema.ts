import { z } from 'zod'

export const createRealizationSchema = z.object({
  title: z.string().trim().min(2, 'Título obrigatório').max(180, 'Título muito longo'),
  description: z.string().trim().min(2, 'Descrição obrigatória').max(4000, 'Descrição muito longa'),
  day: z.string().min(1, 'Escolha a data'),
})

export type CreateRealizationValues = z.infer<typeof createRealizationSchema>
