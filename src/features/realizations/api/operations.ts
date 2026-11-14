import { graphql } from '@/lib/graphql/__generated__/gql'

export const MobileRealizationsDocument = graphql(`
  query MobileRealizations($condoId: String!, $limit: Int, $offset: Int) {
    mobileRealizations(condoId: $condoId, limit: $limit, offset: $offset) {
      id
      title
      heldIn
      coverImageUrl
    }
  }
`)

export const MobileRealizationDocument = graphql(`
  query MobileRealization($id: String!) {
    mobileRealization(id: $id) {
      id
      title
      description
      heldIn
      photoUrls
      beforePhotoUrls
      canCreate
    }
  }
`)

export const MobileRealizationAccessDocument = graphql(`
  query MobileRealizationAccess($condoId: String!) {
    mobileRealizationAccess(condoId: $condoId) {
      canCreate
    }
  }
`)

export const MobileCreateRealizationDocument = graphql(`
  mutation MobileCreateRealization($data: MobileCreateRealizationInput!) {
    mobileCreateRealization(data: $data) {
      id
      title
    }
  }
`)
