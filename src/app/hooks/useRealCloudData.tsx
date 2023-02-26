import React, { useEffect, useMemo, useState } from "react";
import { ErrorV2Beta, queryClient, QueryResponseV2Beta, RecordV2Beta } from "@dynatrace-sdk/client-query-v02";
import { Cloud } from "../types/CloudTypes";

const CLOUDSTUB = [
  {
    cloudType: "EC2",
    metricKey: "dt.cloud.aws.ec2.cpu.usage",
    icon: "aws.svg",
    cloud: "AWS",
    setupPath: "/#settings/awsmonitoring",
  },
  {
    cloudType: "AZURE",
    metricKey: "dt.cloud.azure.vm.cpu_usage",
    icon: "azure.svg",
    cloud: "Azure",
    setupPath: "/#settings/azuremonitoring",
  },
  {
    cloudType: "GOOGLE_CLOUD_PLATFORM",
    metricKey: "cloud.gcp.compute_googleapis_com.guest.cpu.usage_time",
    icon: "gcp.svg",
    cloud: "Google Cloud Platform",
    setupPath: "/ui/hub/technologies/google-cloud-platform",
  },
  {
    cloudType: "VMWare",
    metricKey: "dt.cloud.vmware.vm.cpu.usage",
    icon: "vm.svg",
    cloud: "VM Ware",
    setupPath: "/#settings/vmwaremonitoring",
  },
] as Cloud[];

export const useRealCloudData = () => {
  const [realCloudData, setRealCloudData] = useState<Cloud[]>(CLOUDSTUB);
  const [error, setError] = useState();
  const [runningDQL, setRunningDQL] = useState<boolean>(false);

  //when getData becomes true, fire DQL queries
  const fetchQueries = () => {
    try {
      setRunningDQL(true);
      const oneAgentHostsQuery = queryClient.query({
        query: `fetch dt.entity.host
              | filter cloudType <> "" OR hypervisorType == "VMWARE"
              | fieldsAdd cloud = if(cloudType <> "", cloudType, else:"VMWare")
              | summarize by:{cloud}, count()`,
      });
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
              | filter isNull(lookup.ip)
              | limit 100000`,
      });

      //Update clouds with query data
      oneAgentHostsQuery.then((res) => {
        //   console.log("oneAgentHostsQuery:", res.records);
        setRealCloudData((oldClouds) => {
          const newClouds = [...oldClouds]; //new object to update state
          res.records?.forEach((r) => {
            switch (r.values.cloud) {
              case "EC2":
                {
                  const nc = newClouds.find((c) => c.cloudType == "EC2");
                  if (nc) nc.oneagentHosts = Number(r.values["count()"]);
                }
                break;
              case "GOOGLE_CLOUD_PLATFORM":
                {
                  const nc = newClouds.find((c) => c.cloudType == "GOOGLE_CLOUD_PLATFORM");
                  if (nc) nc.oneagentHosts = Number(r.values["count()"]);
                }
                break;
              case "AZURE":
                {
                  const nc = newClouds.find((c) => c.cloudType == "AZURE");
                  if (nc) nc.oneagentHosts = Number(r.values["count()"]);
                }
                break;
              case "VMWare":
                {
                  const nc = newClouds.find((c) => c.cloudType == "VMWare");
                  if (nc) nc.oneagentHosts = Number(r.values["count()"]);
                }
                break;
            }
          });
          return newClouds;
        });
      },(e)=>setError(e));
      cloudHostsQuery.then((res) => {
        //   console.log("cloudHostsQuery:", res.records);
        setRealCloudData((oldClouds) => {
          const newClouds = [...oldClouds]; //new object to update state
          res.records?.forEach((r) => {
            switch (r.values["metric.key"]) {
              case "dt.cloud.aws.ec2.cpu.usage":
                {
                  const nc = newClouds.find((c) => c.metricKey == "dt.cloud.aws.ec2.cpu.usage");
                  const num = Number(r.values["count()"]);
                  if (nc) {
                    nc.cloudHosts = num;
                    if (num != null && !isNaN(num)) nc.cloudStatus = true;
                  }
                }
                break;
              case "dt.cloud.azure.vm.cpu_usage":
                {
                  const nc = newClouds.find((c) => c.metricKey == "dt.cloud.azure.vm.cpu_usage");
                  const num = Number(r.values["count()"]);
                  if (nc) {
                    nc.cloudHosts = num;
                    if (num != null && !isNaN(num)) nc.cloudStatus = true;
                  }
                }
                break;
              case "cloud.gcp.compute_googleapis_com.guest.cpu.usage_time":
                {
                  const nc = newClouds.find(
                    (c) => c.metricKey == "cloud.gcp.compute_googleapis_com.guest.cpu.usage_time"
                  );
                  const num = Number(r.values["count()"]);
                  if (nc) {
                    nc.cloudHosts = num;
                    if (num != null && !isNaN(num)) nc.cloudStatus = true;
                  }
                }
                break;
              case "dt.cloud.vmware.vm.cpu.usage":
                {
                  const nc = newClouds.find((c) => c.metricKey == "dt.cloud.vmware.vm.cpu.usage");
                  const num = Number(r.values["count()"]);
                  if (nc) {
                    nc.cloudHosts = num;
                    if (num != null && !isNaN(num)) nc.cloudStatus = true;
                  }
                }
                break;
            }
          });
          return newClouds;
        });
      },(e)=>setError(e));
      awsHostsQuery.then((res) => {
        //   console.log("awsHostsQuery:", res.records);
        setRealCloudData((oldClouds) => {
          const newClouds = [...oldClouds]; //new object to update state
          const nc = newClouds.find((c) => c.cloudType == "EC2");
          if (nc) nc.unmonitoredCloud = res.records as any[];
          return newClouds;
        });
      },(e)=>setError(e));
      azureHostsQuery.then((res) => {
        //   console.log("azureHostsQuery:", res.records);
        setRealCloudData((oldClouds) => {
          const newClouds = [...oldClouds]; //new object to update state
          const nc = newClouds.find((c) => c.cloudType == "AZURE");
          if (nc) nc.unmonitoredCloud = res.records as any[];
          return newClouds;
        });
      },(e)=>setError(e));
      gcpHostsQuery.then((res) => {
        //   console.log("gcpHostsQuery:", res.records);
        setRealCloudData((oldClouds) => {
          const newClouds = [...oldClouds]; //new object to update state
          const nc = newClouds.find((c) => c.cloudType == "GOOGLE_CLOUD_PLATFORM");
          if (nc) nc.unmonitoredCloud = res.records as any[];
          return newClouds;
        });
      },(e)=>setError(e));
      vmwareHostsQuery.then((res) => {
        //   console.log("vmwareHostsQuery:", res.records);
        setRealCloudData((oldClouds) => {
          const newClouds = [...oldClouds]; //new object to update state
          const nc = newClouds.find((c) => c.cloudType == "VMWare");
          if (nc) nc.unmonitoredCloud = res.records as any[];
          return newClouds;
        });
      },(e)=>setError(e));
      Promise.allSettled([oneAgentHostsQuery,cloudHostsQuery,awsHostsQuery,azureHostsQuery,gcpHostsQuery,vmwareHostsQuery]).then(results=>{
        console.log("fetchQueries complete:",results);
        setRunningDQL(false);
      })
    } catch (e) {
      setError(e);
    }
  };

  return { realCloudData, fetchQueries, error, runningDQL };
};
