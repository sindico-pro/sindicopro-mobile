import { fireEvent, render, waitFor } from '@testing-library/react-native'

import { SignInForm } from '@/features/auth/components/sign-in-form'

describe('SignInForm', () => {
  it('valida os campos e envia credenciais válidas', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    const view = await render(<SignInForm onSubmit={onSubmit} />)

    fireEvent.press(view.getByRole('button', { name: 'Entrar' }))

    expect(await view.findByText('E-mail inválido')).toBeTruthy()
    expect(view.getByText('Senha obrigatória')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.changeText(view.getByLabelText('E-mail'), 'ana@example.com')
    fireEvent.changeText(view.getByLabelText('Senha'), 'segredo')
    fireEvent.press(view.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(onSubmit.mock.calls.at(-1)?.[0]).toEqual({
        email: 'ana@example.com',
        password: 'segredo',
      })
    })
  })
})
