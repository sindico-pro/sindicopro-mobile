import { z } from 'zod'

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  isEmployee: z.boolean(),
  createdByPersonId: z.string().nullable(),
  showPanel: z.boolean(),
  profileSlugs: z.array(z.string()),
  status: z.string(),
})

export type SessionUser = z.infer<typeof sessionUserSchema>

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  status: z.string(),
  createdByPersonId: z.string().nullable().optional(),
  isEmployee: z.boolean().nullable().optional(),
  showPanel: z.boolean().nullable().optional(),
  personContext: z
    .array(
      z.object({
        profile: z
          .object({
            slug: z.string(),
          })
          .nullable()
          .optional(),
      }),
    )
    .optional(),
})

export const createSessionSchema = z.object({
  token: z.string().min(1),
  refreshToken: z.string().min(1),
  person: personSchema,
})

export const refreshTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).nullable().optional(),
})

export function toSessionUser(person: z.infer<typeof personSchema>): SessionUser {
  return {
    id: person.id,
    name: person.name,
    email: person.email,
    status: person.status,
    isEmployee: person.isEmployee === true,
    createdByPersonId: person.createdByPersonId ?? null,
    showPanel: person.showPanel === true,
    profileSlugs: (person.personContext ?? [])
      .map((context) => context.profile?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  }
}
