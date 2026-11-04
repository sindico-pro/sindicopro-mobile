import { filterCatalog } from '@/features/menu/filter-catalog'

const features = ['occurrence', 'kanban', 'notification']

describe('catálogo do menu', () => {
  it('encontra por sinônimo e ignora acento', () => {
    expect(filterCatalog(features, 'chamado').flatMap((section) => section.items.map((item) => item.name))).toEqual([
      'Ocorrências',
    ])
    expect(filterCatalog(features, 'ocorrencia').flatMap((section) => section.items.map((item) => item.id))).toEqual([
      'occurrences',
    ])
  })

  it('esconde módulo sem permissão e módulo que ainda não existe no app', () => {
    const names = filterCatalog(['kanban'], '').flatMap((section) => section.items.map((item) => item.name))
    expect(names).toContain('Tarefas')
    expect(names).not.toContain('Ocorrências')
    expect(names).not.toContain('Notificações')
    expect(names).toContain('Abrir no site')
    expect(names).toContain('Sair')
  })

  it('mantém o sinônimo de multa no catálogo, sem mostrar item sem tela', () => {
    expect(filterCatalog(features, 'multa')).toEqual([])
    expect(filterCatalog(features, 'advertencia')).toEqual([])
  })
})
