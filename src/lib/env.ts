import { z } from 'zod'

const envSchema = z.object({
  EXPO_PUBLIC_GRAPHQL_URL: z.string().url(),
})

let graphqlUrl: string | null = null

export function getGraphqlUrl(): string {
  if (graphqlUrl) return graphqlUrl

  const parsed = envSchema.safeParse({
    EXPO_PUBLIC_GRAPHQL_URL: process.env.EXPO_PUBLIC_GRAPHQL_URL,
  })

  if (!parsed.success) {
    throw new Error(
      'EXPO_PUBLIC_GRAPHQL_URL inválida ou ausente. Copie .env.example para .env.local.',
    )
  }

  graphqlUrl = parsed.data.EXPO_PUBLIC_GRAPHQL_URL
  return graphqlUrl
}
