process.env.EXPO_PUBLIC_GRAPHQL_URL = 'http://localhost:7400/graphql'

jest.mock('expo-network', () => ({
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
  getNetworkStateAsync: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
}))
