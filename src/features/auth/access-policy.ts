import type { SessionUser } from '@/features/auth/api/schemas'

export const MANAGER_PROFILE_SLUGS = [
  'condominium-manager',
  'external-condominium-manager',
  'sub-condominium-manager',
] as const

export function canAccessApp(input: { isEmployee: boolean; profileSlugs: string[] }) {
  if (input.isEmployee) return true
  return input.profileSlugs.some((slug) =>
    (MANAGER_PROFILE_SLUGS as readonly string[]).includes(slug),
  )
}

export function profileLabel(user: Pick<SessionUser, 'isEmployee' | 'profileSlugs'>) {
  if (user.isEmployee) return 'Equipe'
  if (user.profileSlugs.includes('sub-condominium-manager')) return 'Sub-síndico'
  if (user.profileSlugs.includes('condominium-manager')) return 'Síndico morador'
  if (user.profileSlugs.includes('external-condominium-manager')) return 'Síndico'
  return 'Síndico'
}

export function canSeeCondos(user: Pick<SessionUser, 'isEmployee' | 'showPanel'>) {
  return !user.isEmployee || user.showPanel
}
