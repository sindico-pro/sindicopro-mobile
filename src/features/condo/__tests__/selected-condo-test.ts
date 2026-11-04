import * as SecureStore from 'expo-secure-store'

import { clearStoredSession } from '@/features/auth/session/session-storage'
import { resolveSelection, shouldPromptCondo } from '@/features/condo/selection'
import {
  SELECTED_CONDO_KEY,
  loadSelectedCondo,
  saveSelectedCondo,
} from '@/features/condo/selected-condo'

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
})

it('escolhe o único condomínio e descarta o salvo que perdeu o acesso', () => {
  expect(resolveSelection(['only'], 'other')).toBe('only')
  expect(resolveSelection(['a', 'b'], 'b')).toBe('b')
  expect(resolveSelection(['a', 'b'], 'gone')).toBeNull()
  expect(resolveSelection(['a', 'b'], null)).toBeNull()
  expect(shouldPromptCondo(2, false)).toBe(true)
  expect(shouldPromptCondo(2, true)).toBe(false)
  expect(shouldPromptCondo(1, false)).toBe(false)
})

it('grava e lê o condomínio da pessoa', async () => {
  await saveSelectedCondo('person-1', 'condo-1')
  const [, body] = store.setItemAsync.mock.calls[0]
  store.getItemAsync.mockResolvedValue(body)
  expect(await loadSelectedCondo('person-1')).toBe('condo-1')
  expect(await loadSelectedCondo('person-2')).toBeNull()
})

it('apaga o condomínio junto com a sessão', async () => {
  await clearStoredSession()
  expect(store.deleteItemAsync).toHaveBeenCalledWith(SELECTED_CONDO_KEY, expect.anything())
})
