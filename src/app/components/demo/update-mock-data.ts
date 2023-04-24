import { QueryClient } from '@tanstack/react-query';
import { CloudInfo } from 'src/app/hooks/useOneAgentHosts';
import { generateHostData } from './generate-host-data';
import { CloudHostStatus, CloudType, UnmonitoredCloud } from 'src/app/types/CloudTypes';

export function updateMockData(queryClient: QueryClient, cloudType: CloudType) {
  const oneagentHosts = queryClient.getQueryData<CloudInfo>(['one-agent-host', { demoMode: true }]);
  const demoHosts = Number(oneagentHosts?.[cloudType]) ?? 1;
  const hostStatus = {
    status: true,
    hosts: Math.round((1 + Math.random()) * demoHosts),
  };
  const unmonitoredHosts = generateHostData(hostStatus.hosts - demoHosts, 'NEWCLOUDHOST', 'newcloud');

  queryClient.setQueryData<CloudHostStatus>(['hosts-status', cloudType, { demoMode: true }], hostStatus);
  queryClient.setQueryData<UnmonitoredCloud[]>(['unmonitored-hosts', cloudType], unmonitoredHosts);
  return unmonitoredHosts;
}
