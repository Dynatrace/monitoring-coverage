import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemoMode } from './useDemoMode';
import { Meta } from '../types/Meta';
import { updateMockData } from '../components/demo/update-mock-data';
import { settingsObjectsClient, SettingsObjectCreate } from '@dynatrace-sdk/client-classic-environment-v2';
import { VmwareSetting } from '../types/CloudTypes';
import { VMWARE_SETTINGS_SCHEMA } from "../constants";

async function noop() {
  return Promise.resolve() as unknown as Promise<Response>;
}

async function fetcher(formData: FormData) {
  const vmwareSettings = {
    enabled: true,
    label: formData.get('label'),
    ipaddress: formData.get('ipaddress'),
    username: formData.get('username'),
    password: formData.get('password'),
  } as VmwareSetting;

  const vmwarePayload = {
    schemaId: VMWARE_SETTINGS_SCHEMA,
    value: vmwareSettings,
    scope: "environment",
  } as SettingsObjectCreate;

  return settingsObjectsClient.postSettingsObjects({body: [vmwarePayload]}) as any;
}

export function useVMWareSettings() {
  const queryClient = useQueryClient();
  const demoMode = useDemoMode();

  const meta: Meta = {
    successTitle: 'Cloud connection created',
    successMessage: 'Successfully created connection to VMWare.' + (demoMode ? ' (demo)' : ''),
    errorTitle: 'Failed to create connection to VMWare.' + (demoMode ? ' (demo)' : ''),
  };

  return useMutation({
    mutationFn: (formData: FormData) => (demoMode ? noop() : fetcher(formData)),
    mutationKey: [{ demoMode }],
    meta,
    onSuccess: () => {
      if (demoMode) {
        updateMockData(queryClient, 'VMWare');
      } else {
        // trigger a refetch for host status after mutation was successful by invalidating the query
        queryClient.invalidateQueries({ queryKey: ['hosts-status', 'VMWare'] });
      }
    },
  });
}
