import { z } from 'zod'
import { AppError } from '@/lib/graphql/errors'

export function getGraphqlUrl(): string {
  const parsed = z.string().url().safeParse(process.env.EXPO_PUBLIC_GRAPHQL_URL)
  if (!parsed.success || !['http:', 'https:'].includes(new URL(parsed.data).protocol)) {
    throw new AppError(
      'configuration',
      'Configure EXPO_PUBLIC_GRAPHQL_URL em .env.local para acessar o servidor.',
    )
  }
  const url = new URL(parsed.data)
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (!__DEV__ && url.protocol !== 'https:')
  ) {
    throw new AppError(
      'configuration',
      'Use uma URL HTTPS sem credenciais ou parâmetros para o servidor.',
    )
  }
  return parsed.data
}
