import { graphql } from '@/lib/graphql/__generated__/gql'

export const CreateSessionDocument = graphql(`
  mutation CreateSession($data: CreateAuthInput!) {
    createSession(data: $data) {
      token
      refreshToken
      person {
        id
        name
        email
        status
        createdByPersonId
        isEmployee
        showPanel
        personContext {
          profile {
            slug
          }
        }
      }
    }
  }
`)

export const RefreshTokenClientSideDocument = graphql(`
  mutation RefreshTokenClientSide($data: RefreshTokenClientSideInput!) {
    refreshTokenClientSide(data: $data) {
      accessToken
      refreshToken
    }
  }
`)

export const SignOutDocument = graphql(`
  mutation SignOut($personId: String!) {
    signOut(personId: $personId)
  }
`)

export const PersonAccountByPersonIdDocument = graphql(`
  query PersonAccountByPersonId($person_id: String!) {
    personAccountByPersonId(person_id: $person_id) {
      status
    }
  }
`)
