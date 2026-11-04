import { graphql } from '@/lib/graphql/__generated__/gql'

export const MobileCondosDocument = graphql(`
  query MobileCondos {
    mobileCondos {
      id
      name
      features
    }
  }
`)
