import { graphql } from '@/lib/graphql/__generated__/gql'

export const GetCondosByPersonDocument = graphql(`
  query GetCondosByPerson($person_id: String!) {
    getCondosByPerson(person_id: $person_id) {
      id
      name
      phone
      document
      status
    }
  }
`)

export const FetchCondosPersonHasAccessDocument = graphql(`
  query FetchCondosPersonHasAccess($person_id: String!, $created_by_person_id: String!) {
    fetchCondosPersonHasAccess(person_id: $person_id, created_by_person_id: $created_by_person_id) {
      id
      name
      phone
      document
      status
    }
  }
`)
