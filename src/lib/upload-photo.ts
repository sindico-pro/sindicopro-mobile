import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'

import { getAuthBridge } from '@/lib/graphql/auth-bridge'
import { AppError } from '@/lib/graphql/errors'
import { getGraphqlUrl } from '@/lib/env'

export type PickedPhoto = { uri: string; width?: number }

export function uploadEndpoint(graphqlUrl: string, userId: string) {
  const endpoint = new URL(graphqlUrl)
  const base = endpoint.pathname.replace(/\/graphql\/?$/, '')
  endpoint.pathname = `${base}/upload/${encodeURIComponent(userId)}`
  endpoint.search = ''
  endpoint.hash = ''
  return endpoint.toString()
}

export async function compressPhoto(uri: string) {
  const context = ImageManipulator.manipulate(uri, { maxWidth: 1600 })
  const image = await context.renderAsync()
  const saved = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG })
  return saved.uri
}

export async function pickPhoto(source: 'camera' | 'library'): Promise<PickedPhoto | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) {
    throw new AppError(
      'bad_request',
      source === 'camera'
        ? 'Permita o uso da câmera para tirar a foto.'
        : 'Permita o acesso às fotos para escolher uma imagem.',
    )
  }
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 })
  const asset = result.canceled ? null : result.assets[0]
  if (!asset) return null
  return { uri: asset.uri, width: asset.width }
}

export function uploadPhoto(input: {
  userId: string
  condoId: string
  uri: string
  bucket: string
  folderPath: string
  onProgress?: (ratio: number) => void
}) {
  const endpoint = uploadEndpoint(getGraphqlUrl(), input.userId)
  const token = getAuthBridge()?.getAccessToken()
  const body = new FormData()
  body.append('file', { uri: input.uri, name: 'foto.jpg', type: 'image/jpeg' } as unknown as Blob)
  body.append('bucket', input.bucket)
  body.append('condoId', input.condoId)
  body.append('folderPath', input.folderPath)

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) input.onProgress?.(event.loaded / event.total)
    }
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new AppError('server', 'Não foi possível enviar a foto. Tente de novo.'))
        return
      }
      try {
        const parsed = JSON.parse(xhr.responseText) as { url?: string }
        if (!parsed.url) {
          reject(new AppError('invalid_response', 'O servidor não devolveu a foto.'))
          return
        }
        resolve(parsed.url)
      } catch (cause) {
        reject(new AppError('invalid_response', 'O servidor não devolveu a foto.', { cause }))
      }
    }
    xhr.onerror = () => reject(new AppError('network', 'Sem conexão para enviar a foto.'))
    xhr.open('POST', endpoint)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(body)
  })
}

export async function uploadPhotos(input: {
  userId: string
  condoId: string
  uris: string[]
  bucket: string
  folderPath: string
}) {
  const urls: string[] = []
  for (const uri of input.uris) {
    const compressed = await compressPhoto(uri)
    urls.push(
      await uploadPhoto({
        userId: input.userId,
        condoId: input.condoId,
        uri: compressed,
        bucket: input.bucket,
        folderPath: input.folderPath,
      }),
    )
  }
  return urls
}
