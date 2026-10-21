import { messageForSignInError } from '@/features/auth/errors'
import { AppError } from '@/lib/graphql/errors'

describe('mensagens de login', () => {
  it('não enumera conta inativa, inexistente ou senha incorreta', () => {
    expect(messageForSignInError(new AppError('unauthenticated', 'interno'))).toBe(
      'E-mail ou senha incorretos, ou conta indisponível.',
    )
  })
  it('não expõe erros internos do servidor', () => {
    expect(messageForSignInError(new AppError('server', 'SQL stack/password'))).toBe(
      'Não foi possível entrar. Tente novamente.',
    )
  })
  it('explica rede, armazenamento e configuração', () => {
    for (const type of ['network', 'timeout', 'storage', 'configuration'] as const)
      expect(messageForSignInError(new AppError(type, 'ação necessária'))).toBe('ação necessária')
  })
})
