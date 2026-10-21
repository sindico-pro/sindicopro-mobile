import * as SecureStore from 'expo-secure-store'
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
} from '@/features/auth/session/session-storage'

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device',
  isAvailableAsync: jest.fn(async () => true),
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))
const store = jest.mocked(SecureStore)
beforeEach(() => {
  jest.clearAllMocks()
  store.isAvailableAsync.mockResolvedValue(true)
  store.getItemAsync.mockResolvedValue(null)
  store.setItemAsync.mockResolvedValue(undefined)
  store.deleteItemAsync.mockResolvedValue(undefined)
})
it('persiste só refresh e metadados numa única escrita segura', async () => {
  await saveStoredSession('refresh')
  expect(store.setItemAsync).toHaveBeenCalledTimes(1)
  const [key, body, options] = store.setItemAsync.mock.calls[0]
  expect(key).toBe('sindicopro.mobile-session.v1')
  expect(JSON.parse(body)).toEqual({
    version: 1,
    refreshToken: 'refresh',
    endpoint: process.env.EXPO_PUBLIC_GRAPHQL_URL,
  })
  expect(options).toEqual({ keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY })
})
it('não trata armazenamento indisponível como ausência de sessão', async () => {
  store.isAvailableAsync.mockResolvedValue(false)
  await expect(loadStoredSession()).rejects.toMatchObject({ type: 'storage' })
  await expect(saveStoredSession('refresh')).rejects.toMatchObject({ type: 'storage' })
  await expect(clearStoredSession()).rejects.toMatchObject({ type: 'storage' })
})
it('não esconde falhas de leitura nem apaga credencial por erro transitório', async () => {
  store.getItemAsync.mockRejectedValue(new Error('locked'))
  await expect(loadStoredSession()).rejects.toMatchObject({ type: 'storage' })
  expect(store.deleteItemAsync).not.toHaveBeenCalled()
})
it('limpa formato inválido e credencial de outro ambiente', async () => {
  store.getItemAsync.mockResolvedValueOnce('{bad')
  expect(await loadStoredSession()).toBeNull()
  store.getItemAsync.mockResolvedValueOnce(
    JSON.stringify({
      version: 1,
      endpoint: 'https://other.example/graphql',
      refreshToken: 'other',
    }),
  )
  expect(await loadStoredSession()).toBeNull()
  expect(store.deleteItemAsync).toHaveBeenCalledWith(
    'sindicopro.mobile-session.v1',
    expect.anything(),
  )
})
it('propaga falhas de escrita e de exclusão', async () => {
  store.setItemAsync.mockRejectedValue(new Error('full'))
  await expect(saveStoredSession('refresh')).rejects.toMatchObject({ type: 'storage' })
  store.deleteItemAsync.mockRejectedValue(new Error('locked'))
  await expect(clearStoredSession()).rejects.toMatchObject({ type: 'storage' })
})
