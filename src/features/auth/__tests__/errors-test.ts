import { AccessDeniedError, messageForSignInError } from '@/features/auth/errors'
import { AppError } from '@/lib/graphql/errors'

describe('messageForSignInError', () => {
  it('traduz credenciais inválidas e conta inativa', () => {
    expect(messageForSignInError(new AppError('unauthenticated', 'Email or Password Incorrect!'))).toBe(
      'E-mail ou senha incorretos',
    )
    expect(
      messageForSignInError(
        new AppError('unauthenticated', 'This account is inactive, contact the administrator'),
      ),
    ).toBe('Esta conta está inativa. Fale com o administrador.')
  })

  it('não trata falha de createSession como sessão renovável na mensagem', () => {
    expect(messageForSignInError(new AppError('unauthenticated', 'Unauthorized'))).toBe(
      'E-mail ou senha incorretos',
    )
  })

  it('explica rede, payload inválido e perfil bloqueado', () => {
    expect(messageForSignInError(new AppError('network', 'Sem conexão. Verifique sua internet e tente novamente.'))).toBe(
      'Sem conexão. Verifique sua internet e tente novamente.',
    )
    expect(messageForSignInError(new AppError('invalid_response', 'qualquer'))).toBe(
      'Resposta inesperada do servidor. Tente novamente.',
    )
    expect(messageForSignInError(new AccessDeniedError())).toBe(
      'Este app é destinado a síndicos e suas equipes',
    )
  })
})
