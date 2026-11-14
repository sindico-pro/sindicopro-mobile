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

export function getKanbanBucket(): string {
  const parsed = z.string().min(1).safeParse(process.env.EXPO_PUBLIC_KANBAN_CARD_BUCKET_NAME)
  if (!parsed.success) {
    throw new AppError(
      'configuration',
      'Configure EXPO_PUBLIC_KANBAN_CARD_BUCKET_NAME em .env.local para enviar fotos.',
    )
  }
  return parsed.data
}

export function getRealizationsBucket(): string {
  const parsed = z.string().min(1).safeParse(process.env.EXPO_PUBLIC_REALIZATIONS_BUCKET_NAME)
  if (!parsed.success) {
    throw new AppError(
      'configuration',
      'Configure EXPO_PUBLIC_REALIZATIONS_BUCKET_NAME em .env.local para enviar fotos.',
    )
  }
  return parsed.data
}

export function getWebUrl(): string | null {
  const raw = process.env.EXPO_PUBLIC_WEB_URL
  if (!raw) return null
  const parsed = z.string().url().safeParse(raw)
  if (!parsed.success || !['http:', 'https:'].includes(new URL(parsed.data).protocol)) return null
  const url = new URL(parsed.data)
  if (url.username || url.password || url.search || url.hash || (!__DEV__ && url.protocol !== 'https:')) {
    return null
  }
  return parsed.data
}
