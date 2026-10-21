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

export type CreateSessionMutationVariables = Exact<{
  data: CreateAuthInput;
}>;


export type CreateSessionMutation = { createSession: { token: string, refreshToken: string, person: { id: string, name: string, email: string, status: string, createdByPersonId: string | null, isEmployee: boolean | null, showPanel: boolean | null, personContext: Array<{ profile: { slug: string } }> } } };

export type RefreshTokenClientSideMutationVariables = Exact<{
  data: RefreshTokenClientSideInput;
}>;


export type RefreshTokenClientSideMutation = { refreshTokenClientSide: { accessToken: string, refreshToken: string | null } };

export type SignOutMutationVariables = Exact<{
  personId: string;
}>;


export type SignOutMutation = { signOut: boolean };

export type PersonAccountByPersonIdQueryVariables = Exact<{
  person_id: string;
}>;


export type PersonAccountByPersonIdQuery = { personAccountByPersonId: { status: string } };

export type GetCondosByPersonQueryVariables = Exact<{
  person_id: string;
}>;


export type GetCondosByPersonQuery = { getCondosByPerson: Array<{ id: string, name: string, phone: string, document: string, status: string }> };

export type FetchCondosPersonHasAccessQueryVariables = Exact<{
  person_id: string;
  created_by_person_id: string;
}>;


export type FetchCondosPersonHasAccessQuery = { fetchCondosPersonHasAccess: Array<{ id: string, name: string, phone: string, document: string, status: string }> };

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

export const CreateSessionDocument = new TypedDocumentString(`
    mutation CreateSession($data: CreateAuthInput!) {
  createSession(data: $data) {
    token
    refreshToken
    person {
      id
      name
      email
      status
      createdByPersonId
      isEmployee
      showPanel
      personContext {
        profile {
          slug
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<CreateSessionMutation, CreateSessionMutationVariables>;
export const RefreshTokenClientSideDocument = new TypedDocumentString(`
    mutation RefreshTokenClientSide($data: RefreshTokenClientSideInput!) {
  refreshTokenClientSide(data: $data) {
    accessToken
    refreshToken
  }
}
    `) as unknown as TypedDocumentString<RefreshTokenClientSideMutation, RefreshTokenClientSideMutationVariables>;
export const SignOutDocument = new TypedDocumentString(`
    mutation SignOut($personId: String!) {
  signOut(personId: $personId)
}
    `) as unknown as TypedDocumentString<SignOutMutation, SignOutMutationVariables>;
export const PersonAccountByPersonIdDocument = new TypedDocumentString(`
    query PersonAccountByPersonId($person_id: String!) {
  personAccountByPersonId(person_id: $person_id) {
    status
  }
}
    `) as unknown as TypedDocumentString<PersonAccountByPersonIdQuery, PersonAccountByPersonIdQueryVariables>;
export const GetCondosByPersonDocument = new TypedDocumentString(`
    query GetCondosByPerson($person_id: String!) {
  getCondosByPerson(person_id: $person_id) {
    id
    name
    phone
    document
    status
  }
}
    `) as unknown as TypedDocumentString<GetCondosByPersonQuery, GetCondosByPersonQueryVariables>;
export const FetchCondosPersonHasAccessDocument = new TypedDocumentString(`
    query FetchCondosPersonHasAccess($person_id: String!, $created_by_person_id: String!) {
  fetchCondosPersonHasAccess(
    person_id: $person_id
    created_by_person_id: $created_by_person_id
  ) {
    id
    name
    phone
    document
    status
  }
}
    `) as unknown as TypedDocumentString<FetchCondosPersonHasAccessQuery, FetchCondosPersonHasAccessQueryVariables>;