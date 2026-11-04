/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type CreateAuthInput = {
  email: string;
  password: string;
};

export type MobileCreateTaskInput = {
  condoId: string;
  description?: string | null | undefined;
  dueDate?: string | null | undefined;
  photoUrls?: Array<string> | null | undefined;
  priority: string;
  responsibleId?: string | null | undefined;
  title: string;
};

export type MobileOccurrenceFilter =
  | 'CLOSED'
  | 'OPEN'
  | 'PENDING_MANAGER'
  | 'WITHOUT_RESPONSE';

export type MobileTaskDue =
  | 'OVERDUE'
  | 'TODAY'
  | 'TOMORROW';

export type MobileTaskPhotoKind =
  | 'AFTER'
  | 'BEFORE';

export type MobileTaskStatus =
  | 'DONE'
  | 'IN_PROGRESS'
  | 'TODO';

export type RefreshTokenClientSideInput = {
  refreshToken: string;
};

export type CreateMobileSessionMutationVariables = Exact<{
  data: CreateAuthInput;
}>;


export type CreateMobileSessionMutation = { createMobileSession: { accessToken: string, refreshToken: string, person: { id: string, name: string, email: string, status: string } } };

export type RefreshMobileSessionMutationVariables = Exact<{
  data: RefreshTokenClientSideInput;
}>;


export type RefreshMobileSessionMutation = { refreshMobileSession: { accessToken: string, refreshToken: string } };

export type RevokeMobileSessionMutationVariables = Exact<{
  refreshToken: string;
}>;


export type RevokeMobileSessionMutation = { revokeMobileSession: boolean };

export type MobileMeQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileMeQuery = { mobileMe: { id: string, name: string, email: string, status: string } };

export type MobileCondosQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileCondosQuery = { mobileCondos: Array<{ id: string, name: string, features: Array<string> }> };

export type MobileHomeQueryVariables = Exact<{
  condoId: string;
}>;


export type MobileHomeQuery = { mobileHome: { occurrences: { open: number, withoutResponse: number, pendingManager: number, closed: number } | null, tasks: { overdue: number, dueToday: number, dueTomorrow: number } | null, recentRealizations: Array<{ id: string, title: string, heldIn: string | null, coverImageUrl: string | null }> | null } };

export type MobileOccurrencesQueryVariables = Exact<{
  condoId: string;
  filter: MobileOccurrenceFilter;
}>;


export type MobileOccurrencesQuery = { mobileOccurrences: Array<{ id: string, title: string, status: string, occurredAt: string | null, createdAt: string | null }> };

export type MobileTaskCountsQueryVariables = Exact<{
  condoId: string;
}>;


export type MobileTaskCountsQuery = { mobileTaskCounts: { todo: number, doing: number, done: number, overdue: number, canCreate: boolean, canExecute: boolean, mineLocked: boolean } };

export type MobileTaskListQueryVariables = Exact<{
  condoId: string;
  status: MobileTaskStatus;
  due?: MobileTaskDue | null | undefined;
  mine?: boolean | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;


export type MobileTaskListQuery = { mobileTaskList: Array<{ id: string, title: string, priority: string, dueDate: string | null, isOverdue: boolean, responsibleName: string | null, status: MobileTaskStatus, photoCount: number, commentCount: number }> };

export type MobileTaskQueryVariables = Exact<{
  id: string;
}>;


export type MobileTaskQuery = { mobileTask: { id: string, title: string, description: string, priority: string, dueDate: string | null, isOverdue: boolean, status: MobileTaskStatus, responsibleId: string | null, responsibleName: string | null, beforePhotoUrls: Array<string>, afterPhotoUrls: Array<string>, startedByName: string | null, startedAt: string | null, completedByName: string | null, completedAt: string | null, occurrenceId: string | null, occurrenceTitle: string | null, canExecute: boolean, canEdit: boolean, canCreate: boolean, comments: Array<{ id: string, content: string, authorName: string, createdAt: string }> } };

export type MobileTaskFormOptionsQueryVariables = Exact<{
  condoId: string;
}>;


export type MobileTaskFormOptionsQuery = { mobileTaskFormOptions: { canCreate: boolean, responsibles: Array<{ id: string, name: string }>, categories: Array<{ id: string, name: string }> } };

export type MobileMoveTaskMutationVariables = Exact<{
  id: string;
  status: MobileTaskStatus;
}>;


export type MobileMoveTaskMutation = { mobileMoveTask: { id: string, status: MobileTaskStatus } };

export type MobileAddTaskCommentMutationVariables = Exact<{
  id: string;
  content: string;
}>;


export type MobileAddTaskCommentMutation = { mobileAddTaskComment: { id: string } };

export type MobileAddTaskPhotosMutationVariables = Exact<{
  id: string;
  kind: MobileTaskPhotoKind;
  urls: Array<string> | string;
}>;


export type MobileAddTaskPhotosMutation = { mobileAddTaskPhotos: { id: string } };

export type MobileRemoveTaskPhotoMutationVariables = Exact<{
  id: string;
  url: string;
}>;


export type MobileRemoveTaskPhotoMutation = { mobileRemoveTaskPhoto: { id: string } };

export type MobileCreateTaskMutationVariables = Exact<{
  data: MobileCreateTaskInput;
}>;


export type MobileCreateTaskMutation = { mobileCreateTask: { id: string, title: string } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const CreateMobileSessionDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<CreateMobileSessionMutation, CreateMobileSessionMutationVariables>;
export const RefreshMobileSessionDocument = new TypedDocumentString(`
    mutation RefreshMobileSession($data: RefreshTokenClientSideInput!) {
  refreshMobileSession(data: $data) {
    accessToken
    refreshToken
  }
}
    `) as unknown as TypedDocumentString<RefreshMobileSessionMutation, RefreshMobileSessionMutationVariables>;
export const RevokeMobileSessionDocument = new TypedDocumentString(`
    mutation RevokeMobileSession($refreshToken: String!) {
  revokeMobileSession(refreshToken: $refreshToken)
}
    `) as unknown as TypedDocumentString<RevokeMobileSessionMutation, RevokeMobileSessionMutationVariables>;
export const MobileMeDocument = new TypedDocumentString(`
    query MobileMe {
  mobileMe {
    id
    name
    email
    status
  }
}
    `) as unknown as TypedDocumentString<MobileMeQuery, MobileMeQueryVariables>;
export const MobileCondosDocument = new TypedDocumentString(`
    query MobileCondos {
  mobileCondos {
    id
    name
    features
  }
}
    `) as unknown as TypedDocumentString<MobileCondosQuery, MobileCondosQueryVariables>;
export const MobileHomeDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<MobileHomeQuery, MobileHomeQueryVariables>;
export const MobileOccurrencesDocument = new TypedDocumentString(`
    query MobileOccurrences($condoId: String!, $filter: MobileOccurrenceFilter!) {
  mobileOccurrences(condoId: $condoId, filter: $filter) {
    id
    title
    status
    occurredAt
    createdAt
  }
}
    `) as unknown as TypedDocumentString<MobileOccurrencesQuery, MobileOccurrencesQueryVariables>;
export const MobileTaskCountsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<MobileTaskCountsQuery, MobileTaskCountsQueryVariables>;
export const MobileTaskListDocument = new TypedDocumentString(`
    query MobileTaskList($condoId: String!, $status: MobileTaskStatus!, $due: MobileTaskDue, $mine: Boolean, $limit: Int, $offset: Int) {
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
    `) as unknown as TypedDocumentString<MobileTaskListQuery, MobileTaskListQueryVariables>;
export const MobileTaskDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<MobileTaskQuery, MobileTaskQueryVariables>;
export const MobileTaskFormOptionsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<MobileTaskFormOptionsQuery, MobileTaskFormOptionsQueryVariables>;
export const MobileMoveTaskDocument = new TypedDocumentString(`
    mutation MobileMoveTask($id: String!, $status: MobileTaskStatus!) {
  mobileMoveTask(id: $id, status: $status) {
    id
    status
  }
}
    `) as unknown as TypedDocumentString<MobileMoveTaskMutation, MobileMoveTaskMutationVariables>;
export const MobileAddTaskCommentDocument = new TypedDocumentString(`
    mutation MobileAddTaskComment($id: String!, $content: String!) {
  mobileAddTaskComment(id: $id, content: $content) {
    id
  }
}
    `) as unknown as TypedDocumentString<MobileAddTaskCommentMutation, MobileAddTaskCommentMutationVariables>;
export const MobileAddTaskPhotosDocument = new TypedDocumentString(`
    mutation MobileAddTaskPhotos($id: String!, $kind: MobileTaskPhotoKind!, $urls: [String!]!) {
  mobileAddTaskPhotos(id: $id, kind: $kind, urls: $urls) {
    id
  }
}
    `) as unknown as TypedDocumentString<MobileAddTaskPhotosMutation, MobileAddTaskPhotosMutationVariables>;
export const MobileRemoveTaskPhotoDocument = new TypedDocumentString(`
    mutation MobileRemoveTaskPhoto($id: String!, $url: String!) {
  mobileRemoveTaskPhoto(id: $id, url: $url) {
    id
  }
}
    `) as unknown as TypedDocumentString<MobileRemoveTaskPhotoMutation, MobileRemoveTaskPhotoMutationVariables>;
export const MobileCreateTaskDocument = new TypedDocumentString(`
    mutation MobileCreateTask($data: MobileCreateTaskInput!) {
  mobileCreateTask(data: $data) {
    id
    title
  }
}
    `) as unknown as TypedDocumentString<MobileCreateTaskMutation, MobileCreateTaskMutationVariables>;