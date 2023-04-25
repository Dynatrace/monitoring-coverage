import { queryExecutionClient } from '@dynatrace-sdk/client-query';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { CloudType, UnmonitoredCloud } from '../types/CloudTypes';
import { useDemoMode } from './useDemoMode';
import { updateMockData } from '../components/demo/update-mock-data';

type CloudQueryMap = { [key in CloudType]: string };

const cloudQueryMap: CloudQueryMap = {
  EC2: `fetch dt.entity.EC2_INSTANCE
  | fieldsAdd host=runs[dt.entity.host], entity.detected_name, ipAddress = localIp
  | lookup [fetch dt.entity.host | fieldsAdd isMonitoringCandidate], sourceField:host, lookupField:id, prefix:"host."
  | filterOut host.isMonitoringCandidate == false
  | fields id, entity.name, entity.detected_name, ipAddress = localIp`,
  AZURE: `fetch dt.entity.azure_vm
  | fieldsAdd host=runs[dt.entity.host], entity.detected_name, ipAddress
  | lookup [fetch dt.entity.host | fieldsAdd isMonitoringCandidate], sourceField:host, lookupField:id, prefix:"host."
  | filterOut host.isMonitoringCandidate == false
  | fields id, entity.name, entity.detected_name, ipAddress`,
  GOOGLE_CLOUD_PLATFORM: `fetch \`dt.entity.cloud:gcp:gce_instance\`
  | lookup [fetch \`dt.entity.host\`
  | filter gceInstanceId <> ""
  | fieldsAdd instance_id=gceInstanceId], lookupField: gceInstanceId, sourceField:entity.name
  | filter isNull(lookup.id)`,
  VMWare: `fetch dt.entity.virtualmachine
  | fieldsAdd ip = ipAddress[0]
  | lookup [fetch dt.entity.host
    | filter in(id,entitySelector("type(host),fromRelationships.runsOn(type(virtualmachine))"))
    | fieldsAdd ip = ipAddress[0]], lookupField: ip, sourceField:ip
  | filter isNull(lookup.ip)
  | fields id, entity.name, ipAddress=ip`,
};

async function fetcher(cloudType: CloudType) {
  const query = cloudQueryMap[cloudType];

  return queryExecutionClient
    .queryExecute({
      body: {
        //get all AWS hosts w/o OneAgent
        query,
        requestTimeoutMilliseconds: 5000,
      },
    })
    .then((res) => {
      let unmonitored: UnmonitoredCloud[] = [];

      if (res.result?.records) {
        unmonitored = res.result?.records as UnmonitoredCloud[];
      }
      return unmonitored;
    });
}

function demoFetcher(queryClient: QueryClient, cloudType: CloudType) {
  return updateMockData(queryClient, cloudType);
}

export function useUnmonitoredHosts(cloudType: CloudType) {
  const demoMode = useDemoMode();
  const queryClient = useQueryClient();

  return useQuery({
    queryFn: () => (demoMode ? demoFetcher(queryClient, cloudType) : fetcher(cloudType)),
    queryKey: ['unmonitored-hosts', cloudType, {demoMode}],
  });
}
