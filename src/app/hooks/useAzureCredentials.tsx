import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemoMode } from './useDemoMode';
import { Meta } from '../types/Meta';
import { updateMockData } from '../components/demo/update-mock-data';
import { functions } from '@dynatrace-sdk/app-utils';
import { showToast } from '@dynatrace/strato-components-preview';
import { getSettingsWriterToken } from '../tokens';
import { ENVIRONMENT_URL } from 'env';

async function noop() {
  return Promise.resolve() as unknown as Promise<Response>;
}

async function fetcher(formData: FormData) {
  const azurePayload = {
    label: formData.get('name'),
    appId: formData.get('clientId'),
    directoryId: formData.get('tenantId'),
    key: formData.get('secretKey'),
    active: true,
    autoTagging: true,
  };
  const token = await getSettingsWriterToken();

  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'Authorization': 'Api-Token ' + token,
      'Content-Type': 'application/json; charset=utf-8',
      'accept': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(azurePayload),
  };
  const url = `${ENVIRONMENT_URL}api/config/v1/azure/credentials`;

  return functions
    .call('gen-2-proxy', { url, requestInit })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        let message = data.error.message;
        if (data.error.constraintViolations) {
          message += data.error.constraintViolations.map((violation) => violation.message).join('. ');
        }
        throw new Error(message);
      }
      return data;
    });
}

export function useAzureCredentials() {
  const queryClient = useQueryClient();
  const demoMode = useDemoMode();

  const meta: Meta = {
    successTitle: 'Cloud connection created',
    successMessage: 'Successfully created connection to Azure.' + (demoMode ? ' (demo)' : ''),
    errorTitle: 'Failed to create connection to Azure.' + (demoMode ? ' (demo)' : ''),
  };

  return useMutation({
    mutationFn: (formData: FormData) => (demoMode ? noop() : fetcher(formData)),
    mutationKey: [{ demoMode }],
    meta,
    onSuccess: () => {
      if (demoMode) {
        updateMockData(queryClient, 'AZURE');
      } else {
        // trigger a refetch for host status after mutation was successful by invalidating the query
        queryClient.invalidateQueries({ queryKey: ['hosts-status', 'AZURE'] });
      }
    },
  });
}
