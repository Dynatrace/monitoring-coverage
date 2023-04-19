import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettingsWriterToken } from './useInstallerDownloadToken';
import { GEN2URL } from '../constants';
import { useDemoMode } from './useDemoMode';
import { Meta } from '../types/Meta';
import { updateMockData } from '../components/demo/update-mock-data';
import { functions } from '@dynatrace/util-app';

async function noop() {
  return Promise.resolve() as unknown as Promise<Response>;
}

async function fetcher(formData: FormData) {
  const token = await getSettingsWriterToken();
  const url = `${GEN2URL}/api/config/v1/azure/credentials`;
  const azurePayload = {
    label: name,
    appId: formData.get('clientId'),
    directoryId: formData.get('tenantId'),
    key: formData.get('secretKey'),
    active: true,
    autoTagging: true,
  };
  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'Authorization': 'Api-Token ' + token,
      'Content-Type': 'application/json; charset=utf-8',
      'accept': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(azurePayload),
  };
  return functions.call("gen-2-proxy", { url, requestInit });
}

export function useAzureCredentials() {
  const queryClient = useQueryClient();
  const demoMode = useDemoMode();

  const meta: Meta = {
    successTitle: 'Cloud connection created',
    successMessage: 'Successfully created connection to Azure.',
    errorTitle: 'Cloud connection could not be created',
    errorMessage: 'Failed to create connection to Azure.'
  }

  return useMutation({
    mutationFn: (formData: FormData) => demoMode ? noop() : fetcher(formData),
    mutationKey: [{ demoMode }],
    meta,
    onSuccess: () => {
      if (demoMode) {
        updateMockData(queryClient, 'AZURE');
      } else {
        // trigger a refetch for host status after mutation was successful by invalidating the query
        queryClient.invalidateQueries({ queryKey: ['host-status'] });
      }
    },
  });
}
