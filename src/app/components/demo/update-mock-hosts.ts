import { QueryClient } from '@tanstack/react-query';
import { CloudHostStatus, CloudType } from 'src/app/types/CloudTypes';

export function updateMockHosts(queryClient: QueryClient, cloudType: CloudType) {
  const cloudHosts = queryClient.getQueryData<CloudHostStatus>(['hosts-status', cloudType, { demoMode: true }]);

  queryClient.setQueryData(['one-agent-host', { demoMode: true }], (prev) => {
    if (prev !== undefined && cloudHosts) {
      return { ...prev, cloudType: cloudHosts.hosts };
    }
    return prev;
  });
}
