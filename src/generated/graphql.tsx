import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date and time */
  DateTime: { input: any; output: any; }
};

export type Mutation = {
  __typename?: 'Mutation';
  startVoiceStory: VoiceStory;
};


export type MutationStartVoiceStoryArgs = {
  phone: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  retellCalls?: Maybe<Array<Maybe<VoiceStory>>>;
  retellVoiceStory?: Maybe<VoiceStory>;
  voiceStory?: Maybe<VoiceStory>;
};


export type QueryRetellVoiceStoryArgs = {
  id: Scalars['String']['input'];
};


export type QueryVoiceStoryArgs = {
  id: Scalars['String']['input'];
};

export type VoiceStory = {
  __typename?: 'VoiceStory';
  audioUrl?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  phoneE164?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  transcript?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type RetellCallsQueryVariables = Exact<{ [key: string]: never; }>;


export type RetellCallsQuery = { __typename?: 'Query', retellCalls?: Array<{ __typename?: 'VoiceStory', id: string, audioUrl?: string | null, transcript?: string | null, phoneE164?: string | null, createdAt?: any | null, updatedAt?: any | null } | null> | null };

export type RetellVoiceStoryQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type RetellVoiceStoryQuery = { __typename?: 'Query', retellVoiceStory?: { __typename?: 'VoiceStory', id: string, status?: string | null, audioUrl?: string | null, transcript?: string | null } | null };

export type StartVoiceStoryMutationVariables = Exact<{
  phone: Scalars['String']['input'];
}>;


export type StartVoiceStoryMutation = { __typename?: 'Mutation', startVoiceStory: { __typename?: 'VoiceStory', id: string, status?: string | null } };

export type VoiceStoryQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type VoiceStoryQuery = { __typename?: 'Query', voiceStory?: { __typename?: 'VoiceStory', id: string, status?: string | null, audioUrl?: string | null, transcript?: string | null } | null };


export const RetellCallsDocument = gql`
    query RetellCalls {
  retellCalls {
    id
    audioUrl
    transcript
    phoneE164
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useRetellCallsQuery__
 *
 * To run a query within a React component, call `useRetellCallsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRetellCallsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRetellCallsQuery({
 *   variables: {
 *   },
 * });
 */
export function useRetellCallsQuery(baseOptions?: Apollo.QueryHookOptions<RetellCallsQuery, RetellCallsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RetellCallsQuery, RetellCallsQueryVariables>(RetellCallsDocument, options);
      }
export function useRetellCallsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RetellCallsQuery, RetellCallsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RetellCallsQuery, RetellCallsQueryVariables>(RetellCallsDocument, options);
        }
export type RetellCallsQueryHookResult = ReturnType<typeof useRetellCallsQuery>;
export type RetellCallsLazyQueryHookResult = ReturnType<typeof useRetellCallsLazyQuery>;
export type RetellCallsQueryResult = Apollo.QueryResult<RetellCallsQuery, RetellCallsQueryVariables>;
export const RetellVoiceStoryDocument = gql`
    query RetellVoiceStory($id: String!) {
  retellVoiceStory(id: $id) {
    id
    status
    audioUrl
    transcript
  }
}
    `;

/**
 * __useRetellVoiceStoryQuery__
 *
 * To run a query within a React component, call `useRetellVoiceStoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useRetellVoiceStoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRetellVoiceStoryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRetellVoiceStoryQuery(baseOptions: Apollo.QueryHookOptions<RetellVoiceStoryQuery, RetellVoiceStoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RetellVoiceStoryQuery, RetellVoiceStoryQueryVariables>(RetellVoiceStoryDocument, options);
      }
export function useRetellVoiceStoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RetellVoiceStoryQuery, RetellVoiceStoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RetellVoiceStoryQuery, RetellVoiceStoryQueryVariables>(RetellVoiceStoryDocument, options);
        }
export type RetellVoiceStoryQueryHookResult = ReturnType<typeof useRetellVoiceStoryQuery>;
export type RetellVoiceStoryLazyQueryHookResult = ReturnType<typeof useRetellVoiceStoryLazyQuery>;
export type RetellVoiceStoryQueryResult = Apollo.QueryResult<RetellVoiceStoryQuery, RetellVoiceStoryQueryVariables>;
export const StartVoiceStoryDocument = gql`
    mutation StartVoiceStory($phone: String!) {
  startVoiceStory(phone: $phone) {
    id
    status
  }
}
    `;
export type StartVoiceStoryMutationFn = Apollo.MutationFunction<StartVoiceStoryMutation, StartVoiceStoryMutationVariables>;

/**
 * __useStartVoiceStoryMutation__
 *
 * To run a mutation, you first call `useStartVoiceStoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartVoiceStoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startVoiceStoryMutation, { data, loading, error }] = useStartVoiceStoryMutation({
 *   variables: {
 *      phone: // value for 'phone'
 *   },
 * });
 */
export function useStartVoiceStoryMutation(baseOptions?: Apollo.MutationHookOptions<StartVoiceStoryMutation, StartVoiceStoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartVoiceStoryMutation, StartVoiceStoryMutationVariables>(StartVoiceStoryDocument, options);
      }
export type StartVoiceStoryMutationHookResult = ReturnType<typeof useStartVoiceStoryMutation>;
export type StartVoiceStoryMutationResult = Apollo.MutationResult<StartVoiceStoryMutation>;
export type StartVoiceStoryMutationOptions = Apollo.BaseMutationOptions<StartVoiceStoryMutation, StartVoiceStoryMutationVariables>;
export const VoiceStoryDocument = gql`
    query VoiceStory($id: String!) {
  voiceStory(id: $id) {
    id
    status
    audioUrl
    transcript
  }
}
    `;

/**
 * __useVoiceStoryQuery__
 *
 * To run a query within a React component, call `useVoiceStoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useVoiceStoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVoiceStoryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useVoiceStoryQuery(baseOptions: Apollo.QueryHookOptions<VoiceStoryQuery, VoiceStoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VoiceStoryQuery, VoiceStoryQueryVariables>(VoiceStoryDocument, options);
      }
export function useVoiceStoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VoiceStoryQuery, VoiceStoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VoiceStoryQuery, VoiceStoryQueryVariables>(VoiceStoryDocument, options);
        }
export type VoiceStoryQueryHookResult = ReturnType<typeof useVoiceStoryQuery>;
export type VoiceStoryLazyQueryHookResult = ReturnType<typeof useVoiceStoryLazyQuery>;
export type VoiceStoryQueryResult = Apollo.QueryResult<VoiceStoryQuery, VoiceStoryQueryVariables>;