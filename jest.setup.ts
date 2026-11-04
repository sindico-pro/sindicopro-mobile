process.env.EXPO_PUBLIC_GRAPHQL_URL = 'http://localhost:7400/graphql'

jest.mock('lucide-react-native', () => {
  const React = require('react') as typeof import('react')
  const { View } = require('react-native') as typeof import('react-native')
  return new Proxy(
    {},
    {
      get: (_target, name) => {
        if (name === '__esModule') return true
        return (props: object) => React.createElement(View, { ...props, testID: String(name) })
      },
    },
  )
})

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}))

jest.mock('expo-network', () => ({
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
  getNetworkStateAsync: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
}))
