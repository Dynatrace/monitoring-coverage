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

  // const hostQueryStatus = queryClient.getQueryState(['host-status', cloudType, { demoMode: true }]);
  // const unmonitoredQueryStatus = queryClient.getQueryState(['unmonitored-hosts', cloudType]);
  // console.log('update-mock-data:', {
  //   oneagentHosts,
  //   demoHosts,
  //   hostStatus,
  //   unmonitoredHosts,
  //   cloudType,
  //   hostQueryStatus,
  //   unmonitoredQueryStatus,
  // });
  queryClient.setQueryData<CloudHostStatus>(['hosts-status', cloudType, { demoMode: true }], hostStatus);
  queryClient.setQueryData<UnmonitoredCloud[]>(['unmonitored-hosts', cloudType], unmonitoredHosts);
}
