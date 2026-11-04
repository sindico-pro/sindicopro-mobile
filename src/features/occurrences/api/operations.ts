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
