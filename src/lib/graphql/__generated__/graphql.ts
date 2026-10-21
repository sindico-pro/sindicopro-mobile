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