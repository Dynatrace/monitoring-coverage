import { AppRoot } from '@dynatrace/strato-components-preview/core';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app/App';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer, showToast } from '@dynatrace/strato-components-preview';
import { Meta } from './app/types/Meta';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onSuccess: (_, query) => {
      if (query.meta) {
        const { successTitle, successMessage } = query.meta as Meta;
        successTitle && showToast({ title: successTitle, message: successMessage, type: 'info', lifespan: 4000 });
      }
    },
    onError: (error: Error, query) => {
      if (query.meta) {
        const { errorTitle } = query.meta as Meta;
        errorTitle && showToast({ title: errorTitle, message: error.message, type: 'critical' });
      }
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      if (mutation.meta) {
        const { successTitle, successMessage } = mutation.meta as Meta;
        successTitle && showToast({ title: successTitle, message: successMessage, type: 'info', lifespan: 4000 });
      }
    },

    onError: (error: Error, variables, context, mutation) => {
      if (mutation.meta) {
        const { errorTitle } = mutation.meta as Meta;
        errorTitle && showToast({ title: errorTitle, message: error.message, type: 'critical' });
      }
    },
  }),
});

ReactDOM.render(
  <AppRoot>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </AppRoot>,
  document.getElementById('root'),
);
