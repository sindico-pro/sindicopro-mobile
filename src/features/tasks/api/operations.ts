import { graphql } from '@/lib/graphql/__generated__/gql'

export const MobileTaskCountsDocument = graphql(`
  query MobileTaskCounts($condoId: String!) {
    mobileTaskCounts(condoId: $condoId) {
      todo
      doing
      done
      overdue
      canCreate
      canExecute
      mineLocked
    }
  }
`)

export const MobileTaskListDocument = graphql(`
  query MobileTaskList(
    $condoId: String!
    $status: MobileTaskStatus!
    $due: MobileTaskDue
    $mine: Boolean
    $limit: Int
    $offset: Int
  ) {
    mobileTaskList(
      condoId: $condoId
      status: $status
      due: $due
      mine: $mine
      limit: $limit
      offset: $offset
    ) {
      id
      title
      priority
      dueDate
      isOverdue
      responsibleName
      status
      photoCount
      commentCount
    }
  }
`)

export const MobileTaskDocument = graphql(`
  query MobileTask($id: String!) {
    mobileTask(id: $id) {
      id
      title
      description
      priority
      dueDate
      isOverdue
      status
      responsibleId
      responsibleName
      beforePhotoUrls
      afterPhotoUrls
      comments {
        id
        content
        authorName
        createdAt
      }
      startedByName
      startedAt
      completedByName
      completedAt
      occurrenceId
      occurrenceTitle
      canExecute
      canEdit
      canCreate
    }
  }
`)

export const MobileTaskFormOptionsDocument = graphql(`
  query MobileTaskFormOptions($condoId: String!) {
    mobileTaskFormOptions(condoId: $condoId) {
      canCreate
      responsibles {
        id
        name
      }
      categories {
        id
        name
      }
    }
  }
`)

export const MobileMoveTaskDocument = graphql(`
  mutation MobileMoveTask($id: String!, $status: MobileTaskStatus!) {
    mobileMoveTask(id: $id, status: $status) {
      id
      status
    }
  }
`)

export const MobileAddTaskCommentDocument = graphql(`
  mutation MobileAddTaskComment($id: String!, $content: String!) {
    mobileAddTaskComment(id: $id, content: $content) {
      id
    }
  }
`)

export const MobileAddTaskPhotosDocument = graphql(`
  mutation MobileAddTaskPhotos($id: String!, $kind: MobileTaskPhotoKind!, $urls: [String!]!) {
    mobileAddTaskPhotos(id: $id, kind: $kind, urls: $urls) {
      id
    }
  }
`)

export const MobileRemoveTaskPhotoDocument = graphql(`
  mutation MobileRemoveTaskPhoto($id: String!, $url: String!) {
    mobileRemoveTaskPhoto(id: $id, url: $url) {
      id
    }
  }
`)

export const MobileCreateTaskDocument = graphql(`
  mutation MobileCreateTask($data: MobileCreateTaskInput!) {
    mobileCreateTask(data: $data) {
      id
      title
    }
  }
`)
