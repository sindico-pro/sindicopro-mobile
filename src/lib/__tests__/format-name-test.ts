import { firstName, titleCase } from '@/lib/format-name'

it('formata o primeiro nome e o título do condomínio', () => {
  expect(firstName('thyago pereira marques')).toBe('Thyago')
  expect(titleCase('VERDE VALE RESIDENCIA')).toBe('Verde Vale Residencia')
  expect(titleCase('ILHA DO SOL RESIDENCIAL')).toBe('Ilha do Sol Residencial')
})
