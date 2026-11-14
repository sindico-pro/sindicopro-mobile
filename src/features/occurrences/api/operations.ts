import { graphql } from '@/lib/graphql/__generated__/gql'

export const MobileOccurrencesDocument = graphql(`
  query MobileOccurrences($condoId: String!, $filter: MobileOccurrenceFilter!) {
    mobileOccurrences(condoId: $condoId, filter: $filter) {
      id
      title
      status
      occurredAt
      createdAt
    }
  }
`)

export const MobileOccurrenceDocument = graphql(`
  query MobileOccurrence($id: String!) {
    mobileOccurrence(id: $id) {
      id
      title
      description
      status
      occurredAt
      authorName
      fileUrls
      responses {
        id
        content
        fromManager
        authorName
        fileUrls
        createdAt
      }
      canRespond
      canClose
    }
  }
`)

export const MobileOccurrenceAccessDocument = graphql(`
  query MobileOccurrenceAccess($condoId: String!) {
    mobileOccurrenceAccess(condoId: $condoId) {
      canCreate
    }
  }
`)

export const MobileCreateOccurrenceDocument = graphql(`
  mutation MobileCreateOccurrence($data: MobileCreateOccurrenceInput!) {
    mobileCreateOccurrence(data: $data) {
      id
      title
    }
  }
`)

export const MobileRespondOccurrenceDocument = graphql(`
  mutation MobileRespondOccurrence($id: String!, $content: String!, $fileUrls: [String!]) {
    mobileRespondOccurrence(id: $id, content: $content, fileUrls: $fileUrls) {
      id
    }
  }
`)

export const MobileCloseOccurrenceDocument = graphql(`
  mutation MobileCloseOccurrence($id: String!) {
    mobileCloseOccurrence(id: $id) {
      id
    }
  }
`)
