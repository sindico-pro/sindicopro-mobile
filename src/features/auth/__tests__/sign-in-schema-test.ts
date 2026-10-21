import { signInSchema } from '@/features/auth/sign-in-schema'

describe('signInSchema', () => {
  it('rejeita e-mail inválido e senha vazia com as mensagens do web', () => {
    const result = signInSchema.safeParse({ email: 'nao-e-email', password: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toEqual(['E-mail inválido'])
      expect(result.error.flatten().fieldErrors.password).toEqual(['Senha obrigatória'])
    }
  })

  it('aceita credenciais preenchidas', () => {
    expect(signInSchema.safeParse({ email: 'ana@example.com', password: 'segredo' }).success).toBe(
      true,
    )
  })
})
