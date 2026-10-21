import { graphql } from '@/lib/graphql/__generated__/gql'

export const CreateSessionDocument = graphql(`
  mutation CreateMobileSession($data: CreateAuthInput!) {
    createMobileSession(data: $data) {
      accessToken
      refreshToken
      person {
        id
        name
        email
        status
      }
    }
  }
`)

export const RefreshSessionDocument = graphql(`
  mutation RefreshMobileSession($data: RefreshTokenClientSideInput!) {
    refreshMobileSession(data: $data) {
      accessToken
      refreshToken
    }
  }
`)

export const RevokeSessionDocument = graphql(`
  mutation RevokeMobileSession($refreshToken: String!) {
    revokeMobileSession(refreshToken: $refreshToken)
  }
`)

export const CurrentUserDocument = graphql(`
  query MobileMe {
    mobileMe {
      id
      name
      email
      status
    }
  }
`)
