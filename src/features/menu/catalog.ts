import type { MenuIconName } from './menu-icons'

export const menuGroups = ['Operação', 'Pessoas', 'Comunicação', 'Gestão', 'Conta'] as const

export type MenuGroup = (typeof menuGroups)[number]
export type MenuAction = 'route' | 'website' | 'sign-out' | 'condo'

export type CatalogEntry = {
  id: string
  name: string
  group: MenuGroup
  synonyms: string[]
  slug: string | null
  action: MenuAction
  route: string | null
  path?: string
  icon: MenuIconName
}

export const catalog: CatalogEntry[] = [
  { id: 'occurrences', name: 'Ocorrências', group: 'Operação', synonyms: ['chamado', 'reclamação'], slug: 'occurrence', action: 'route', route: '/occurrences', icon: 'BookMarked' },
  { id: 'tasks', name: 'Tarefas', group: 'Operação', synonyms: ['kanban', 'atividade'], slug: 'kanban', action: 'route', route: '/tasks', icon: 'SquareKanban' },
  { id: 'realizations', name: 'Realizações', group: 'Operação', synonyms: ['foto', 'execução'], slug: 'realization', action: 'route', route: null, icon: 'Waypoints' },
  { id: 'patrol', name: 'Ronda', group: 'Operação', synonyms: ['ronda', 'patrulha'], slug: 'patrol', action: 'route', route: null, icon: 'ShieldCheck' },
  { id: 'moving', name: 'Mudanças', group: 'Operação', synonyms: ['mudança'], slug: 'moving', action: 'route', route: null, icon: 'Truck' },
  { id: 'packages', name: 'Encomendas', group: 'Operação', synonyms: ['pacote', 'correio'], slug: 'package', action: 'route', route: null, icon: 'PackageCheck' },
  { id: 'residents', name: 'Moradores', group: 'Pessoas', synonyms: ['morador', 'unidade'], slug: 'resident', action: 'route', route: null, icon: 'Users' },
  { id: 'employees', name: 'Funcionários', group: 'Pessoas', synonyms: ['equipe', 'colaborador'], slug: 'employee-registration', action: 'route', route: null, icon: 'UserRoundPlus' },
  { id: 'permissions', name: 'Permissões', group: 'Pessoas', synonyms: ['acesso', 'perfil de acesso'], slug: 'permissions', action: 'route', route: null, icon: 'UsersRound' },
  { id: 'notifications', name: 'Notificações', group: 'Comunicação', synonyms: ['multa', 'advertência', 'comunicado'], slug: 'notification', action: 'route', route: null, icon: 'Bell' },
  { id: 'survey', name: 'Enquete', group: 'Comunicação', synonyms: ['votação', 'pesquisa'], slug: 'survey', action: 'route', route: null, icon: 'ScrollText' },
  { id: 'priority-survey', name: 'Enquete de prioridade', group: 'Comunicação', synonyms: ['prioridade'], slug: 'priority-survey', action: 'route', route: null, icon: 'NotebookPen' },
  { id: 'nps', name: 'NPS', group: 'Comunicação', synonyms: ['satisfação'], slug: 'nps', action: 'route', route: null, icon: 'ChartPie' },
  { id: 'reports', name: 'Denúncias', group: 'Comunicação', synonyms: ['anônimo', 'relato'], slug: 'anonymous-report', action: 'route', route: null, icon: 'ShieldAlert' },
  { id: 'contracts', name: 'Contratos', group: 'Gestão', synonyms: ['contrato'], slug: 'contract', action: 'route', route: null, icon: 'Folders' },
  { id: 'suppliers', name: 'Fornecedores', group: 'Gestão', synonyms: ['prestador'], slug: 'supplier', action: 'route', route: null, icon: 'Container' },
  { id: 'inventory', name: 'Inventário', group: 'Gestão', synonyms: ['vistoria'], slug: 'inventory', action: 'route', route: null, icon: 'Package' },
  { id: 'files', name: 'Arquivos', group: 'Gestão', synonyms: ['documento', 'anexo'], slug: 'storage', action: 'route', route: null, icon: 'FolderOpen' },
  { id: 'notes', name: 'Notas', group: 'Gestão', synonyms: ['bloco de notas', 'anotação'], slug: 'notepad', action: 'route', route: null, icon: 'NotepadText' },
  { id: 'website', name: 'Abrir no site', group: 'Conta', synonyms: ['web', 'navegador', 'site'], slug: null, action: 'website', route: null, icon: 'ExternalLink' },
  { id: 'privacy-policy', name: 'Política de privacidade', group: 'Conta', synonyms: ['lgpd', 'dados pessoais', 'privacidade'], slug: null, action: 'website', route: null, path: '/privacy-policy', icon: 'ShieldCheck' },
  { id: 'account-condos', name: 'Trocar condomínio', group: 'Conta', synonyms: ['condomínios'], slug: null, action: 'condo', route: null, icon: 'Building2' },
  { id: 'account-sign-out', name: 'Sair', group: 'Conta', synonyms: ['logout', 'encerrar sessão'], slug: null, action: 'sign-out', route: null, icon: 'LogOut' },
]
