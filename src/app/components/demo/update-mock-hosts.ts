import { QueryClient } from '@tanstack/react-query';
import { CloudInfo } from 'src/app/hooks/useOneAgentHosts';
import { CloudHostStatus, CloudType, UnmonitoredCloud } from 'src/app/types/CloudTypes';

export function updateMockHosts(queryClient: QueryClient, cloudType: CloudType) {
  const cloudHosts = queryClient.getQueryData<CloudHostStatus>(['hosts-status', cloudType, { demoMode: true }]);
  // const oneagentHosts = queryClient.getQueryData<CloudInfo>(['one-agent-host', { demoMode: true }]);

  if (cloudHosts == undefined) {
    console.warn('updateMockHosts - cloudHosts undefined');
    console.warn(queryClient.getQueryState(['hosts-status', cloudType, { demoMode: true }]));
  }

  queryClient.setQueryData(['one-agent-host', { demoMode: true }], (olddata) => {
    if (olddata == undefined) {
      console.warn('updateMockHosts - olddate undefined');
      console.warn(queryClient.getQueryState(['one-agent-host', { demoMode: true }]));
      return;
    } else {
      console.log('updateMockHosts:', { olddata });
      const newdata = { ...(olddata as object) };
      newdata[cloudType] = cloudHosts?.hosts;
      return newdata;
    }
  });
}
