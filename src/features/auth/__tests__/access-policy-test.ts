import { canAccessApp, canSeeCondos, profileLabel } from '@/features/auth/access-policy'

describe('canAccessApp', () => {
  it.each([
    'condominium-manager',
    'external-condominium-manager',
    'sub-condominium-manager',
  ])('permite o perfil %s', (slug) => {
    expect(canAccessApp({ isEmployee: false, profileSlugs: [slug] })).toBe(true)
  })

  it('permite funcionário e bloqueia fornecedor e morador', () => {
    expect(canAccessApp({ isEmployee: true, profileSlugs: ['supplier'] })).toBe(true)
    expect(canAccessApp({ isEmployee: false, profileSlugs: ['supplier'] })).toBe(false)
    expect(canAccessApp({ isEmployee: false, profileSlugs: ['resident'] })).toBe(false)
    expect(canAccessApp({ isEmployee: false, profileSlugs: [] })).toBe(false)
  })
})

describe('canSeeCondos', () => {
  it('esconde a lista do funcionário sem painel', () => {
    expect(canSeeCondos({ isEmployee: false, showPanel: false })).toBe(true)
    expect(canSeeCondos({ isEmployee: true, showPanel: true })).toBe(true)
    expect(canSeeCondos({ isEmployee: true, showPanel: false })).toBe(false)
  })
})

describe('profileLabel', () => {
  it('nomeia síndico e equipe', () => {
    expect(profileLabel({ isEmployee: true, profileSlugs: [] })).toBe('Equipe')
    expect(profileLabel({ isEmployee: false, profileSlugs: ['sub-condominium-manager'] })).toBe(
      'Sub-síndico',
    )
  })
})
