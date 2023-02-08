import React, { useEffect, useMemo, useState } from "react";
import { ErrorV2Beta, queryClient, QueryResponseV2Beta, RecordV2Beta } from "@dynatrace-sdk/client-query-v02";
// import { useDQLQuery } from "./useDQLQuery";
import { Cloud } from "../types/CloudTypes";

const ONEAGENTHOSTSQUERY = `fetch dt.entity.host | filter cloudType <> "" OR hypervisorType == "VMWARE" | fieldsAdd cloud = if(cloudType <> "", cloudType, else:"VMWare") | summarize by:{cloud}, count()`.replace(/\n\r\t/, "");

const CLOUDSTUB = [
  {
    cloudType: "EC2",
    icon: "aws.svg",
    cloud: "AWS",
  },
  {
    cloudType: "AZURE",
    icon: "azure.svg",
    cloud: "Azure",
  },
  {
    cloudType: "GOOGLE_CLOUD_PLATFORM",
    icon: "gcp.svg",
    cloud: "Google Cloud Platform",
  },
  {
    cloudType: "VMWare",
    icon: "vm.svg",
    cloud: "VM Ware",
  },
] as Cloud[];

export const useRealCloudData = () => {
  const [clouds, setClouds] = useState<Cloud[]>(CLOUDSTUB);

  //when getData becomes true, fire DQL queries
  const fetchQueries = () => {
    queryClient.verify({query: ONEAGENTHOSTSQUERY})
        .catch(err => console.warn("queryClient.verify:",err))
        .then(res => console.log("queryClient.verify:",res));
    const oneAgentHostsQuery = queryClient.query({ query: ONEAGENTHOSTSQUERY });
    const cloudHostsQuery = queryClient.query({
      query: `fetch metrics
              | filter in(metric.key,"dt.cloud.aws.ec2.cpu.usage","dt.cloud.azure.vm.cpu_usage","cloud.gcp.compute_googleapis_com.guest.cpu.usage_time","dt.cloud.vmware.vm.cpu.usage")
              | fieldsAdd entityId = if(dt.source_entity<>"",
              dt.source_entity,
              else: if(dt.entity.azure_vm<>"",dt.entity.azure_vm,else:\`dt.entity.cloud:gcp:gce_instance\`))
              | summarize by:{metric.key,entityId}, count()
              | summarize by:metric.key, count()`,
    });
    const awsHostsQuery = queryClient.query({
      query: `fetch dt.entity.EC2_INSTANCE
              | filterOut in(entityId,entitySelector("type(EC2_INSTANCE),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
              | fieldsAdd detectedName, ipAddress = localIp`,
    });
    const azureHostsQuery = queryClient.query({
      query: `fetch dt.entity.azure_vm
              | filterOut in(entityId,entitySelector("type(azure_vm),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
              | fieldsAdd detectedName, ipAddress = ipAddress[0]`,
    });
    const gcpHostsQuery = queryClient.query({
      query: `fetch \`dt.entity.cloud:gcp:gce_instance\`
              | lookup [fetch \`dt.entity.host\` 
              | filter gceInstanceId <> "" 
              | fieldsAdd instance_id=gceInstanceId], lookupField: gceInstanceId, sourceField:entityName
              | filter isNull(lookup.entityId)
              //| fieldsAdd ipAddress`,
    });
    const vmwareHostsQuery = queryClient.query({
      query: `fetch dt.entity.virtualmachine
              | fieldsAdd ip = ipAddress[0]
              | lookup [fetch dt.entity.host | filter in(entityId,entitySelector("type(host),fromRelationships.runsOn(type(virtualmachine))")) | fieldsAdd ip = ipAddress[0]], lookupField: ip, sourceField:ip
              | filter isNull(lookup.ip)`,
    });
    const queries = [
      oneAgentHostsQuery,
      cloudHostsQuery,
      awsHostsQuery,
      azureHostsQuery,
      gcpHostsQuery,
      vmwareHostsQuery,
    ];

    Promise.allSettled(queries).then(() => {
      console.log("fetch queries allSettled", queries);
    });
  };

  //   //When queries change state, see if we're done, and update return data
  //   useEffect(() => {
  //     console.log(
  //       "useRealCloudData: useEffect",
  //       queries.map((q) => q.queryState),
  //       queries.map((q) => q.queryState).filter((qs) => qs == "loading").length
  //     );
  //     if (queries.map((q) => q.queryState).filter((qs) => qs == "loading").length === 0) {
  //       console.log("useRealCloudData: all queries finished.",queries.map(q=>q.queryState));
  //       if (oneAgentHostsQuery.queryState == "success") {
  //         console.log("oneAgentHostsQuery success:",oneAgentHostsQuery.result?.records);
  //         for (const res of oneAgentHostsQuery.result?.records || []) {
  //           console.log("useRealCloudData: oneAgentHostsQuery: ", res);
  //         }
  //       }
  //       if (cloudHostsQuery.queryState == "success") {
  //         console.log("cloudHostsQuery success:",cloudHostsQuery.result);
  //         for (const res of cloudHostsQuery.result?.records || []) {
  //           console.log("useRealCloudData: cloudHostsQuery: ", res);
  //         }
  //       }
  //       if (awsHostsQuery.queryState == "success") {
  //         console.log("awsHostsQuery success:",awsHostsQuery.result?.records);
  //         for (const res of awsHostsQuery.result?.records || []) {
  //           console.log("useRealCloudData: awsHostsQuery: ", res);
  //         }
  //       }
  //       if (azureHostsQuery.queryState == "success") {
  //         console.log("azureHostsQuery success:",azureHostsQuery.result?.records);
  //         for (const res of azureHostsQuery.result?.records || []) {
  //           console.log("useRealCloudData: azureHostsQuery: ", res);
  //         }
  //       }
  //       if (gcpHostsQuery.queryState == "success") {
  //         console.log("gcpHostsQuery success:",gcpHostsQuery.result?.records);
  //         for (const res of gcpHostsQuery.result?.records || []) {
  //           console.log("useRealCloudData: gcpHostsQuery: ", res);
  //         }
  //       }
  //       if (vmwareHostsQuery.queryState == "success") {
  //         console.log("vmwareHostsQuery success:",vmwareHostsQuery.result?.records);
  //         for (const res of vmwareHostsQuery.result?.records || []) {
  //           console.log("useRealCloudData: vmwareHostsQuery: ", res);
  //         }
  //       }
  //     }
  //   }, [
  //     oneAgentHostsQuery.queryState,
  //     cloudHostsQuery.queryState,
  //     awsHostsQuery.queryState,
  //     azureHostsQuery.queryState,
  //     gcpHostsQuery.queryState,
  //     vmwareHostsQuery.queryState,
  //   ]);

  return { clouds, fetchQueries };
};
