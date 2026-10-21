import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().trim().email({ message: 'E-mail inválido' }),
  password: z.string().min(1, { message: 'Senha obrigatória' }),
})

export type SignInValues = z.infer<typeof signInSchema>
