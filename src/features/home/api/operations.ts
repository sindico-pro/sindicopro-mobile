import { graphql } from '@/lib/graphql/__generated__/gql'

export const MobileHomeDocument = graphql(`
  query MobileHome($condoId: String!) {
    mobileHome(condoId: $condoId) {
      occurrences {
        open
        withoutResponse
        pendingManager
        closed
      }
      tasks {
        overdue
        dueToday
        dueTomorrow
      }
      recentRealizations {
        id
        title
        heldIn
        coverImageUrl
      }
    }
  }
`)
