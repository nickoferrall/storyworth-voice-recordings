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
  voiceStory?: Maybe<VoiceStory>;
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

export type StartVoiceStoryMutationVariables = Exact<{
  phone: Scalars['String']['input'];
}>;


export type StartVoiceStoryMutation = { __typename?: 'Mutation', startVoiceStory: { __typename?: 'VoiceStory', id: string, status?: string | null } };

export type VoiceStoryQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type VoiceStoryQuery = { __typename?: 'Query', voiceStory?: { __typename?: 'VoiceStory', id: string, status?: string | null, audioUrl?: string | null, transcript?: string | null } | null };


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