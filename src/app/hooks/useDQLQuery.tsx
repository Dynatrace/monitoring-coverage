import {
  ErrorV2Beta,
  queryClient,
  QueryResponseV2Beta,
  RecordV2Beta,
} from '@dynatrace-sdk/client-query-v02';
import { QueryStateType } from '@dynatrace/strato-components-preview/buttons';
import {
  recommendVisualizations,
  VisualizationKind,
} from '@dynatrace/strato-components-preview/conversion-utilities';
import { useState } from 'react';

/**
 * useDQLQuery hook to fetch data from DEUS via @dynatrace/sdk-data
 * @example
 * const { loading, error, result } = useDQLQuery(initialQuery);
 */
export function useDQLQuery() {
  // useState hooks for handling state of the query, the result, the loading and error state.
  // more information on useState can be found here: https://reactjs.org/docs/hooks-state.html
  const [result, setResult] = useState<QueryResponseV2Beta | undefined>(
    undefined,
  );
  const [queryState, setQueryState] = useState<QueryStateType>('idle');
  const [error, setError] = useState<ErrorV2Beta | null>(null);
  const [visualRecommendations, setVisualRecommendations] = useState<
    VisualizationKind[]
  >([]);
  //fetchQuery function can be used e.g. within onClick handler of a button
  const fetchQuery = async (query: string) => {
    setQueryState('loading');
    try {
      const response = await queryClient.query({ query: query });
      const recommendations = recommendVisualizations(
        response.records as RecordV2Beta[],
      );
      setVisualRecommendations(recommendations);
      setQueryState('success');
      setResult(response);
      setError(null);
    } catch (e) {
      let error;
      try{
        error = JSON.parse(e.message)?.error;
      } catch (parseerror){
        error = JSON.stringify(e);
      }
      setVisualRecommendations([]);
      setQueryState('error');
      setResult(undefined);
      setError(error);
    }
  };

  return {
    queryState,
    error,
    result,
    fetchQuery,
    visualRecommendations,
  };
}
