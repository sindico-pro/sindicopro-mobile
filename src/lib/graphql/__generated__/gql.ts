/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateMobileSession($data: CreateAuthInput!) {\n    createMobileSession(data: $data) {\n      accessToken\n      refreshToken\n      person {\n        id\n        name\n        email\n        status\n      }\n    }\n  }\n": typeof types.CreateMobileSessionDocument,
    "\n  mutation RefreshMobileSession($data: RefreshTokenClientSideInput!) {\n    refreshMobileSession(data: $data) {\n      accessToken\n      refreshToken\n    }\n  }\n": typeof types.RefreshMobileSessionDocument,
    "\n  mutation RevokeMobileSession($refreshToken: String!) {\n    revokeMobileSession(refreshToken: $refreshToken)\n  }\n": typeof types.RevokeMobileSessionDocument,
    "\n  query MobileMe {\n    mobileMe {\n      id\n      name\n      email\n      status\n    }\n  }\n": typeof types.MobileMeDocument,
    "\n  query MobileCondos {\n    mobileCondos {\n      id\n      name\n      features\n    }\n  }\n": typeof types.MobileCondosDocument,
    "\n  query MobileHome($condoId: String!) {\n    mobileHome(condoId: $condoId) {\n      occurrences {\n        open\n        withoutResponse\n        pendingManager\n        closed\n      }\n      tasks {\n        overdue\n        dueToday\n        dueTomorrow\n      }\n      recentRealizations {\n        id\n        title\n        heldIn\n        coverImageUrl\n      }\n    }\n  }\n": typeof types.MobileHomeDocument,
    "\n  query MobileOccurrences($condoId: String!, $filter: MobileOccurrenceFilter!) {\n    mobileOccurrences(condoId: $condoId, filter: $filter) {\n      id\n      title\n      status\n      occurredAt\n      createdAt\n    }\n  }\n": typeof types.MobileOccurrencesDocument,
    "\n  query MobileOccurrence($id: String!) {\n    mobileOccurrence(id: $id) {\n      id\n      title\n      description\n      status\n      occurredAt\n      authorName\n      fileUrls\n      responses {\n        id\n        content\n        fromManager\n        authorName\n        fileUrls\n        createdAt\n      }\n      canRespond\n      canClose\n    }\n  }\n": typeof types.MobileOccurrenceDocument,
    "\n  query MobileOccurrenceAccess($condoId: String!) {\n    mobileOccurrenceAccess(condoId: $condoId) {\n      canCreate\n    }\n  }\n": typeof types.MobileOccurrenceAccessDocument,
    "\n  mutation MobileCreateOccurrence($data: MobileCreateOccurrenceInput!) {\n    mobileCreateOccurrence(data: $data) {\n      id\n      title\n    }\n  }\n": typeof types.MobileCreateOccurrenceDocument,
    "\n  mutation MobileRespondOccurrence($id: String!, $content: String!, $fileUrls: [String!]) {\n    mobileRespondOccurrence(id: $id, content: $content, fileUrls: $fileUrls) {\n      id\n    }\n  }\n": typeof types.MobileRespondOccurrenceDocument,
    "\n  mutation MobileCloseOccurrence($id: String!) {\n    mobileCloseOccurrence(id: $id) {\n      id\n    }\n  }\n": typeof types.MobileCloseOccurrenceDocument,
    "\n  query MobileRealizations($condoId: String!, $limit: Int, $offset: Int) {\n    mobileRealizations(condoId: $condoId, limit: $limit, offset: $offset) {\n      id\n      title\n      heldIn\n      coverImageUrl\n    }\n  }\n": typeof types.MobileRealizationsDocument,
    "\n  query MobileRealization($id: String!) {\n    mobileRealization(id: $id) {\n      id\n      title\n      description\n      heldIn\n      photoUrls\n      beforePhotoUrls\n      canCreate\n    }\n  }\n": typeof types.MobileRealizationDocument,
    "\n  query MobileRealizationAccess($condoId: String!) {\n    mobileRealizationAccess(condoId: $condoId) {\n      canCreate\n    }\n  }\n": typeof types.MobileRealizationAccessDocument,
    "\n  mutation MobileCreateRealization($data: MobileCreateRealizationInput!) {\n    mobileCreateRealization(data: $data) {\n      id\n      title\n    }\n  }\n": typeof types.MobileCreateRealizationDocument,
    "\n  query MobileTaskCounts($condoId: String!) {\n    mobileTaskCounts(condoId: $condoId) {\n      todo\n      doing\n      done\n      overdue\n      canCreate\n      canExecute\n      mineLocked\n    }\n  }\n": typeof types.MobileTaskCountsDocument,
    "\n  query MobileTaskList(\n    $condoId: String!\n    $status: MobileTaskStatus!\n    $due: MobileTaskDue\n    $mine: Boolean\n    $limit: Int\n    $offset: Int\n  ) {\n    mobileTaskList(\n      condoId: $condoId\n      status: $status\n      due: $due\n      mine: $mine\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      title\n      priority\n      dueDate\n      isOverdue\n      responsibleName\n      status\n      photoCount\n      commentCount\n    }\n  }\n": typeof types.MobileTaskListDocument,
    "\n  query MobileTask($id: String!) {\n    mobileTask(id: $id) {\n      id\n      title\n      description\n      priority\n      dueDate\n      isOverdue\n      status\n      responsibleId\n      responsibleName\n      beforePhotoUrls\n      afterPhotoUrls\n      comments {\n        id\n        content\n        authorName\n        createdAt\n      }\n      startedByName\n      startedAt\n      completedByName\n      completedAt\n      occurrenceId\n      occurrenceTitle\n      canExecute\n      canEdit\n      canCreate\n    }\n  }\n": typeof types.MobileTaskDocument,
    "\n  query MobileTaskFormOptions($condoId: String!) {\n    mobileTaskFormOptions(condoId: $condoId) {\n      canCreate\n      responsibles {\n        id\n        name\n      }\n      categories {\n        id\n        name\n      }\n    }\n  }\n": typeof types.MobileTaskFormOptionsDocument,
    "\n  mutation MobileMoveTask($id: String!, $status: MobileTaskStatus!) {\n    mobileMoveTask(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": typeof types.MobileMoveTaskDocument,
    "\n  mutation MobileAddTaskComment($id: String!, $content: String!) {\n    mobileAddTaskComment(id: $id, content: $content) {\n      id\n    }\n  }\n": typeof types.MobileAddTaskCommentDocument,
    "\n  mutation MobileAddTaskPhotos($id: String!, $kind: MobileTaskPhotoKind!, $urls: [String!]!) {\n    mobileAddTaskPhotos(id: $id, kind: $kind, urls: $urls) {\n      id\n    }\n  }\n": typeof types.MobileAddTaskPhotosDocument,
    "\n  mutation MobileRemoveTaskPhoto($id: String!, $url: String!) {\n    mobileRemoveTaskPhoto(id: $id, url: $url) {\n      id\n    }\n  }\n": typeof types.MobileRemoveTaskPhotoDocument,
    "\n  mutation MobileCreateTask($data: MobileCreateTaskInput!) {\n    mobileCreateTask(data: $data) {\n      id\n      title\n    }\n  }\n": typeof types.MobileCreateTaskDocument,
};
const documents: Documents = {
    "\n  mutation CreateMobileSession($data: CreateAuthInput!) {\n    createMobileSession(data: $data) {\n      accessToken\n      refreshToken\n      person {\n        id\n        name\n        email\n        status\n      }\n    }\n  }\n": types.CreateMobileSessionDocument,
    "\n  mutation RefreshMobileSession($data: RefreshTokenClientSideInput!) {\n    refreshMobileSession(data: $data) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.RefreshMobileSessionDocument,
    "\n  mutation RevokeMobileSession($refreshToken: String!) {\n    revokeMobileSession(refreshToken: $refreshToken)\n  }\n": types.RevokeMobileSessionDocument,
    "\n  query MobileMe {\n    mobileMe {\n      id\n      name\n      email\n      status\n    }\n  }\n": types.MobileMeDocument,
    "\n  query MobileCondos {\n    mobileCondos {\n      id\n      name\n      features\n    }\n  }\n": types.MobileCondosDocument,
    "\n  query MobileHome($condoId: String!) {\n    mobileHome(condoId: $condoId) {\n      occurrences {\n        open\n        withoutResponse\n        pendingManager\n        closed\n      }\n      tasks {\n        overdue\n        dueToday\n        dueTomorrow\n      }\n      recentRealizations {\n        id\n        title\n        heldIn\n        coverImageUrl\n      }\n    }\n  }\n": types.MobileHomeDocument,
    "\n  query MobileOccurrences($condoId: String!, $filter: MobileOccurrenceFilter!) {\n    mobileOccurrences(condoId: $condoId, filter: $filter) {\n      id\n      title\n      status\n      occurredAt\n      createdAt\n    }\n  }\n": types.MobileOccurrencesDocument,
    "\n  query MobileOccurrence($id: String!) {\n    mobileOccurrence(id: $id) {\n      id\n      title\n      description\n      status\n      occurredAt\n      authorName\n      fileUrls\n      responses {\n        id\n        content\n        fromManager\n        authorName\n        fileUrls\n        createdAt\n      }\n      canRespond\n      canClose\n    }\n  }\n": types.MobileOccurrenceDocument,
    "\n  query MobileOccurrenceAccess($condoId: String!) {\n    mobileOccurrenceAccess(condoId: $condoId) {\n      canCreate\n    }\n  }\n": types.MobileOccurrenceAccessDocument,
    "\n  mutation MobileCreateOccurrence($data: MobileCreateOccurrenceInput!) {\n    mobileCreateOccurrence(data: $data) {\n      id\n      title\n    }\n  }\n": types.MobileCreateOccurrenceDocument,
    "\n  mutation MobileRespondOccurrence($id: String!, $content: String!, $fileUrls: [String!]) {\n    mobileRespondOccurrence(id: $id, content: $content, fileUrls: $fileUrls) {\n      id\n    }\n  }\n": types.MobileRespondOccurrenceDocument,
    "\n  mutation MobileCloseOccurrence($id: String!) {\n    mobileCloseOccurrence(id: $id) {\n      id\n    }\n  }\n": types.MobileCloseOccurrenceDocument,
    "\n  query MobileRealizations($condoId: String!, $limit: Int, $offset: Int) {\n    mobileRealizations(condoId: $condoId, limit: $limit, offset: $offset) {\n      id\n      title\n      heldIn\n      coverImageUrl\n    }\n  }\n": types.MobileRealizationsDocument,
    "\n  query MobileRealization($id: String!) {\n    mobileRealization(id: $id) {\n      id\n      title\n      description\n      heldIn\n      photoUrls\n      beforePhotoUrls\n      canCreate\n    }\n  }\n": types.MobileRealizationDocument,
    "\n  query MobileRealizationAccess($condoId: String!) {\n    mobileRealizationAccess(condoId: $condoId) {\n      canCreate\n    }\n  }\n": types.MobileRealizationAccessDocument,
    "\n  mutation MobileCreateRealization($data: MobileCreateRealizationInput!) {\n    mobileCreateRealization(data: $data) {\n      id\n      title\n    }\n  }\n": types.MobileCreateRealizationDocument,
    "\n  query MobileTaskCounts($condoId: String!) {\n    mobileTaskCounts(condoId: $condoId) {\n      todo\n      doing\n      done\n      overdue\n      canCreate\n      canExecute\n      mineLocked\n    }\n  }\n": types.MobileTaskCountsDocument,
    "\n  query MobileTaskList(\n    $condoId: String!\n    $status: MobileTaskStatus!\n    $due: MobileTaskDue\n    $mine: Boolean\n    $limit: Int\n    $offset: Int\n  ) {\n    mobileTaskList(\n      condoId: $condoId\n      status: $status\n      due: $due\n      mine: $mine\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      title\n      priority\n      dueDate\n      isOverdue\n      responsibleName\n      status\n      photoCount\n      commentCount\n    }\n  }\n": types.MobileTaskListDocument,
    "\n  query MobileTask($id: String!) {\n    mobileTask(id: $id) {\n      id\n      title\n      description\n      priority\n      dueDate\n      isOverdue\n      status\n      responsibleId\n      responsibleName\n      beforePhotoUrls\n      afterPhotoUrls\n      comments {\n        id\n        content\n        authorName\n        createdAt\n      }\n      startedByName\n      startedAt\n      completedByName\n      completedAt\n      occurrenceId\n      occurrenceTitle\n      canExecute\n      canEdit\n      canCreate\n    }\n  }\n": types.MobileTaskDocument,
    "\n  query MobileTaskFormOptions($condoId: String!) {\n    mobileTaskFormOptions(condoId: $condoId) {\n      canCreate\n      responsibles {\n        id\n        name\n      }\n      categories {\n        id\n        name\n      }\n    }\n  }\n": types.MobileTaskFormOptionsDocument,
    "\n  mutation MobileMoveTask($id: String!, $status: MobileTaskStatus!) {\n    mobileMoveTask(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n": types.MobileMoveTaskDocument,
    "\n  mutation MobileAddTaskComment($id: String!, $content: String!) {\n    mobileAddTaskComment(id: $id, content: $content) {\n      id\n    }\n  }\n": types.MobileAddTaskCommentDocument,
    "\n  mutation MobileAddTaskPhotos($id: String!, $kind: MobileTaskPhotoKind!, $urls: [String!]!) {\n    mobileAddTaskPhotos(id: $id, kind: $kind, urls: $urls) {\n      id\n    }\n  }\n": types.MobileAddTaskPhotosDocument,
    "\n  mutation MobileRemoveTaskPhoto($id: String!, $url: String!) {\n    mobileRemoveTaskPhoto(id: $id, url: $url) {\n      id\n    }\n  }\n": types.MobileRemoveTaskPhotoDocument,
    "\n  mutation MobileCreateTask($data: MobileCreateTaskInput!) {\n    mobileCreateTask(data: $data) {\n      id\n      title\n    }\n  }\n": types.MobileCreateTaskDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateMobileSession($data: CreateAuthInput!) {\n    createMobileSession(data: $data) {\n      accessToken\n      refreshToken\n      person {\n        id\n        name\n        email\n        status\n      }\n    }\n  }\n"): typeof import('./graphql').CreateMobileSessionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RefreshMobileSession($data: RefreshTokenClientSideInput!) {\n    refreshMobileSession(data: $data) {\n      accessToken\n      refreshToken\n    }\n  }\n"): typeof import('./graphql').RefreshMobileSessionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RevokeMobileSession($refreshToken: String!) {\n    revokeMobileSession(refreshToken: $refreshToken)\n  }\n"): typeof import('./graphql').RevokeMobileSessionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileMe {\n    mobileMe {\n      id\n      name\n      email\n      status\n    }\n  }\n"): typeof import('./graphql').MobileMeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileCondos {\n    mobileCondos {\n      id\n      name\n      features\n    }\n  }\n"): typeof import('./graphql').MobileCondosDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileHome($condoId: String!) {\n    mobileHome(condoId: $condoId) {\n      occurrences {\n        open\n        withoutResponse\n        pendingManager\n        closed\n      }\n      tasks {\n        overdue\n        dueToday\n        dueTomorrow\n      }\n      recentRealizations {\n        id\n        title\n        heldIn\n        coverImageUrl\n      }\n    }\n  }\n"): typeof import('./graphql').MobileHomeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileOccurrences($condoId: String!, $filter: MobileOccurrenceFilter!) {\n    mobileOccurrences(condoId: $condoId, filter: $filter) {\n      id\n      title\n      status\n      occurredAt\n      createdAt\n    }\n  }\n"): typeof import('./graphql').MobileOccurrencesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileOccurrence($id: String!) {\n    mobileOccurrence(id: $id) {\n      id\n      title\n      description\n      status\n      occurredAt\n      authorName\n      fileUrls\n      responses {\n        id\n        content\n        fromManager\n        authorName\n        fileUrls\n        createdAt\n      }\n      canRespond\n      canClose\n    }\n  }\n"): typeof import('./graphql').MobileOccurrenceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileOccurrenceAccess($condoId: String!) {\n    mobileOccurrenceAccess(condoId: $condoId) {\n      canCreate\n    }\n  }\n"): typeof import('./graphql').MobileOccurrenceAccessDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileCreateOccurrence($data: MobileCreateOccurrenceInput!) {\n    mobileCreateOccurrence(data: $data) {\n      id\n      title\n    }\n  }\n"): typeof import('./graphql').MobileCreateOccurrenceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileRespondOccurrence($id: String!, $content: String!, $fileUrls: [String!]) {\n    mobileRespondOccurrence(id: $id, content: $content, fileUrls: $fileUrls) {\n      id\n    }\n  }\n"): typeof import('./graphql').MobileRespondOccurrenceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileCloseOccurrence($id: String!) {\n    mobileCloseOccurrence(id: $id) {\n      id\n    }\n  }\n"): typeof import('./graphql').MobileCloseOccurrenceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileRealizations($condoId: String!, $limit: Int, $offset: Int) {\n    mobileRealizations(condoId: $condoId, limit: $limit, offset: $offset) {\n      id\n      title\n      heldIn\n      coverImageUrl\n    }\n  }\n"): typeof import('./graphql').MobileRealizationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileRealization($id: String!) {\n    mobileRealization(id: $id) {\n      id\n      title\n      description\n      heldIn\n      photoUrls\n      beforePhotoUrls\n      canCreate\n    }\n  }\n"): typeof import('./graphql').MobileRealizationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileRealizationAccess($condoId: String!) {\n    mobileRealizationAccess(condoId: $condoId) {\n      canCreate\n    }\n  }\n"): typeof import('./graphql').MobileRealizationAccessDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileCreateRealization($data: MobileCreateRealizationInput!) {\n    mobileCreateRealization(data: $data) {\n      id\n      title\n    }\n  }\n"): typeof import('./graphql').MobileCreateRealizationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileTaskCounts($condoId: String!) {\n    mobileTaskCounts(condoId: $condoId) {\n      todo\n      doing\n      done\n      overdue\n      canCreate\n      canExecute\n      mineLocked\n    }\n  }\n"): typeof import('./graphql').MobileTaskCountsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileTaskList(\n    $condoId: String!\n    $status: MobileTaskStatus!\n    $due: MobileTaskDue\n    $mine: Boolean\n    $limit: Int\n    $offset: Int\n  ) {\n    mobileTaskList(\n      condoId: $condoId\n      status: $status\n      due: $due\n      mine: $mine\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      title\n      priority\n      dueDate\n      isOverdue\n      responsibleName\n      status\n      photoCount\n      commentCount\n    }\n  }\n"): typeof import('./graphql').MobileTaskListDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileTask($id: String!) {\n    mobileTask(id: $id) {\n      id\n      title\n      description\n      priority\n      dueDate\n      isOverdue\n      status\n      responsibleId\n      responsibleName\n      beforePhotoUrls\n      afterPhotoUrls\n      comments {\n        id\n        content\n        authorName\n        createdAt\n      }\n      startedByName\n      startedAt\n      completedByName\n      completedAt\n      occurrenceId\n      occurrenceTitle\n      canExecute\n      canEdit\n      canCreate\n    }\n  }\n"): typeof import('./graphql').MobileTaskDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MobileTaskFormOptions($condoId: String!) {\n    mobileTaskFormOptions(condoId: $condoId) {\n      canCreate\n      responsibles {\n        id\n        name\n      }\n      categories {\n        id\n        name\n      }\n    }\n  }\n"): typeof import('./graphql').MobileTaskFormOptionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileMoveTask($id: String!, $status: MobileTaskStatus!) {\n    mobileMoveTask(id: $id, status: $status) {\n      id\n      status\n    }\n  }\n"): typeof import('./graphql').MobileMoveTaskDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileAddTaskComment($id: String!, $content: String!) {\n    mobileAddTaskComment(id: $id, content: $content) {\n      id\n    }\n  }\n"): typeof import('./graphql').MobileAddTaskCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileAddTaskPhotos($id: String!, $kind: MobileTaskPhotoKind!, $urls: [String!]!) {\n    mobileAddTaskPhotos(id: $id, kind: $kind, urls: $urls) {\n      id\n    }\n  }\n"): typeof import('./graphql').MobileAddTaskPhotosDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileRemoveTaskPhoto($id: String!, $url: String!) {\n    mobileRemoveTaskPhoto(id: $id, url: $url) {\n      id\n    }\n  }\n"): typeof import('./graphql').MobileRemoveTaskPhotoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MobileCreateTask($data: MobileCreateTaskInput!) {\n    mobileCreateTask(data: $data) {\n      id\n      title\n    }\n  }\n"): typeof import('./graphql').MobileCreateTaskDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
