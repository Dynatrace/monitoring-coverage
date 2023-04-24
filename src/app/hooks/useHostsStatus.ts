import { queryExecutionClient } from '@dynatrace-sdk/client-query';
import { useQuery } from '@tanstack/react-query';
import { CloudHostStatus, CloudType } from '../types/CloudTypes';
import { useDemoMode } from './useDemoMode';

type CloudQueryMap = { [key in CloudType]: string };

const cloudQueryMap: CloudQueryMap = {
  EC2: `fetch dt.entity.EC2_INSTANCE
  | filter arn != ""
  | summarize count=count()`,
  AZURE: `fetch dt.entity.azure_vm
  | summarize count=count()`,
  GOOGLE_CLOUD_PLATFORM: `fetch \`dt.entity.cloud:gcp:gce_instance\`
  | summarize count=count()`,
  VMWare: `fetch dt.entity.virtualmachine
  | summarize count=count()`,
};

async function fetcher(cloudType: CloudType) {
  const query = cloudQueryMap[cloudType];

  return queryExecutionClient
    .queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 5000,
      },
    })
    .then((res) => {
      const cloudHostStatus: CloudHostStatus = {};

      if (Array.isArray(res.result?.records)) {
        const firstRecord = res.result?.records[0];
        const num = firstRecord ? Number(firstRecord.count) : undefined;
        cloudHostStatus.hosts = num;
        cloudHostStatus.status = num !== undefined && num > 0;
      }
      return cloudHostStatus;
    });
}

function demoFetcher(cloudType: CloudType): CloudHostStatus {
  switch (cloudType) {
    case 'EC2':
      return { status: true, hosts: 1000 };
    case 'AZURE':
      return { status: false };
    case 'GOOGLE_CLOUD_PLATFORM':
      return { status: true, hosts: 100 };
    case 'VMWare': {
      return { status: true, hosts: 506 };
    }
  }
}

export function useHostsStatus(cloudType: CloudType) {
  const demoMode = useDemoMode();

  return useQuery({
    queryFn: () => (demoMode ? demoFetcher(cloudType) : fetcher(cloudType)),
    queryKey: ['hosts-status', cloudType, { demoMode }],
  });
}
