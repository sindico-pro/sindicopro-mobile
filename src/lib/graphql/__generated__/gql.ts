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
};
const documents: Documents = {
    "\n  mutation CreateMobileSession($data: CreateAuthInput!) {\n    createMobileSession(data: $data) {\n      accessToken\n      refreshToken\n      person {\n        id\n        name\n        email\n        status\n      }\n    }\n  }\n": types.CreateMobileSessionDocument,
    "\n  mutation RefreshMobileSession($data: RefreshTokenClientSideInput!) {\n    refreshMobileSession(data: $data) {\n      accessToken\n      refreshToken\n    }\n  }\n": types.RefreshMobileSessionDocument,
    "\n  mutation RevokeMobileSession($refreshToken: String!) {\n    revokeMobileSession(refreshToken: $refreshToken)\n  }\n": types.RevokeMobileSessionDocument,
    "\n  query MobileMe {\n    mobileMe {\n      id\n      name\n      email\n      status\n    }\n  }\n": types.MobileMeDocument,
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


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
