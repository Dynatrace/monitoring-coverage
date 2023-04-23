import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettingsWriterToken } from './useInstallerDownloadToken';
import { GEN2URL } from '../constants';
import { useDemoMode } from './useDemoMode';
import { Meta } from '../types/Meta';
import { updateMockData } from '../components/demo/update-mock-data';
import { functions } from '@dynatrace/util-app';
import { showToast } from '@dynatrace/strato-components-preview';

async function noop() {
  return Promise.resolve() as unknown as Promise<Response>;
}

async function fetcher(formData: FormData) {
  const token = await getSettingsWriterToken();
  const url = `${GEN2URL}/api/config/v1/aws/credentials`;
  const isKeyBasedAuthentication = formData.get('auth') === 'key';
  const awsPayload = {
    label: formData.get('name'),
    partitionType: formData.get('partition'),
    authenticationData: {
      type: isKeyBasedAuthentication ? 'KEYS' : 'ROLE',
      keyBasedAuthentication: isKeyBasedAuthentication
        ? {
            accessKey: formData.get('accessKeyId'),
            secretKey: formData.get('secretKeyId'),
          }
        : undefined,
      roleBasedAuthentication: !isKeyBasedAuthentication
        ? {
            iamRole: formData.get('role'),
            accountId: formData.get('accountId'),
          }
        : undefined,
    },
  };
  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'Authorization': 'Api-Token ' + token,
      'Content-Type': 'application/json; charset=utf-8',
      'accept': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(awsPayload),
  };
  return functions.call("gen-2-proxy", { url, requestInit });
}

export function useAWSCredentials() {
  const queryClient = useQueryClient();
  const demoMode = useDemoMode();

  const meta: Meta = {
    successTitle: 'Cloud connection created',
    successMessage: 'Successfully created connection to AWS.',
    errorTitle: 'Cloud connection could not be created',
    errorMessage: 'Failed to create connection to AWS.'
  }

  return useMutation({
    mutationFn: (formData: FormData) => demoMode ? noop() : fetcher(formData),
    mutationKey: [{ demoMode }],
    meta,
    onSuccess: () => {
      if (demoMode) {
        updateMockData(queryClient, 'EC2');
        showToast({
          title: "(mock) Cloud connection created",
          type: "info",
          message: `Successfully created connection to ${/*selectedCloud?.cloud*/'AWS'}`,
          lifespan: 4000,
        });
      } else {
        // trigger a refetch for host status after mutation was successful by invalidating the query
        queryClient.invalidateQueries({ queryKey: ['host-status'] });
      }
    },
  });
}
