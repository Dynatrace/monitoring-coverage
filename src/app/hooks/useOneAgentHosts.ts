import { queryExecutionClient } from '@dynatrace-sdk/client-query';
import { useQuery } from '@tanstack/react-query';
import { CloudType } from '../types/CloudTypes';
import { useDemoMode } from './useDemoMode';

export type CloudInfo = { [key in CloudType]: number | null };

async function fetcher() {
  return queryExecutionClient
    .queryExecute({
      body: {
        //get the number of hosts with OneAgents, split by cloud
        query: `fetch dt.entity.host
          | filter cloudType <> "" OR hypervisorType == "VMWARE"
          | fieldsAdd cloud = if(cloudType <> "", cloudType, else:"VMWare")
          | summarize by:{cloud}, count=count()`,
        requestTimeoutMilliseconds: 5000,
      },
    })
    .then((res) => {
      const oneAgentHosts: CloudInfo = {
        EC2: null,
        GOOGLE_CLOUD_PLATFORM: null,
        AZURE: null,
        VMWare: null,
      };
      if (res.result?.records) {
        for (const record of res.result?.records) {
          switch (record?.cloud) {
            case 'EC2':
            case 'GOOGLE_CLOUD_PLATFORM':
            case 'AZURE':
            case 'VMWare':
              oneAgentHosts[record?.cloud] = Number(record?.count);
              break;
          }
        }
      }
      return oneAgentHosts;
    });
}

const demoData: CloudInfo = {
  EC2: 900,
  AZURE: 123,
  GOOGLE_CLOUD_PLATFORM: 99,
  VMWare: 202,
};

function demoFetcher() {
  return demoData;
}

export function useOneAgentHosts() {
  const demoMode = useDemoMode();

  return useQuery({
    queryFn: demoMode ? demoFetcher : fetcher,
    queryKey: ['one-agent-host', { demoMode }],
    initialData: demoMode
      ? demoData
      : {
          EC2: null,
          AZURE: null,
          GOOGLE_CLOUD_PLATFORM: null,
          VMWare: null,
        },
  });
}
