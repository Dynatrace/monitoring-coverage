import React, { useEffect, useMemo, useState } from "react";
import { queryExecutionClient, queryAssistanceClient, QueryStartResponse } from "@dynatrace-sdk/client-query";
import { showToast } from "@dynatrace/strato-components-preview";
import { Cloud, UnmonitoredCloud } from "../types/CloudTypes";

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

const TIMEOUT = 5000;

const GCP_ALL_HOSTS_QUERY = `fetch \`dt.entity.cloud:gcp:gce_instance\`
//| fieldsAdd ipAddress
| summarize count=count()`;

const GCP_UNMONITORED_HOSTS_QUERY = `fetch \`dt.entity.cloud:gcp:gce_instance\`
| lookup [fetch \`dt.entity.host\` 
| filter gceInstanceId <> "" 
| fieldsAdd instance_id=gceInstanceId], lookupField: gceInstanceId, sourceField:entity.name
| filter isNull(lookup.id)
//| fieldsAdd ipAddress`;

export const useRealCloudData = () => {
  const [realCloudData, setRealCloudData] = useState<Cloud[]>(CLOUDSTUB);
  // const [error, toastError] = useState();
  const [runningDQL, setRunningDQL] = useState<boolean>(false);
  const [queriesVerified, setQueriesVerified] = useState<boolean>(false);
  const [gcpValid, setGCPValid] = useState<boolean | undefined>();

  //verify queries before firing them
  useEffect(() => {
    (async () => {
      const verify_GCP_ALL_HOSTS_QUERY = await queryAssistanceClient.queryVerify({
        body: { query: GCP_ALL_HOSTS_QUERY },
      });
      const verify_GCP_UNMONITORED_HOSTS_QUERY = await queryAssistanceClient.queryVerify({
        body: { query: GCP_UNMONITORED_HOSTS_QUERY },
      });
      setGCPValid(verify_GCP_ALL_HOSTS_QUERY.valid && verify_GCP_UNMONITORED_HOSTS_QUERY.valid);

      setQueriesVerified(true);
    })();
  }, []);

  const toastError = (error) => {
    showToast({
      title: "Error getting cloud data with DQL",
      type: "warning",
      message: error.message,
    });
  };

  const fetchQueries = () => {
    if (!queriesVerified) return;

    try {
      setRunningDQL(true);
      // const oneAgentHostsQuery = queryClient.query({
      const oneAgentHostsQuery = queryExecutionClient.queryExecute({
        body: {
          //get the number of hosts with OneAgents, split by cloud
          query: `fetch dt.entity.host
              | filter cloudType <> "" OR hypervisorType == "VMWARE"
              | fieldsAdd cloud = if(cloudType <> "", cloudType, else:"VMWare")
              | summarize by:{cloud}, count=count()`,
          requestTimeoutMilliseconds: TIMEOUT,
        },
      });
      const awsAllHostsQuery = queryExecutionClient.queryExecute({
        body: {
          //get all AWS hosts
          query: `fetch dt.entity.EC2_INSTANCE
              | filter arn != ""
              //| fieldsAdd entity.detected_name, ipAddress = localIp
              | summarize count=count()`,
          requestTimeoutMilliseconds: TIMEOUT,
        },
      });
      const awsUnmonitoredHostsQuery = queryExecutionClient.queryExecute({
        body: {
          //get all AWS hosts w/o OneAgent
          // query: `fetch dt.entity.EC2_INSTANCE
          //     | filterOut in(id,entitySelector("type(EC2_INSTANCE),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
          //     | fieldsAdd entity.detected_name, ipAddress = localIp`,
          query: `fetch dt.entity.EC2_INSTANCE
          | fieldsAdd host=runs[dt.entity.host], entity.detected_name, ipAddress = localIp
          | lookup [fetch dt.entity.host | fieldsAdd isMonitoringCandidate], sourceField:host, lookupField:id, prefix:"host."
          | filterOut host.isMonitoringCandidate == false 
          | fields id, entity.name, entity.detected_name, ipAddress = localIp`,
          requestTimeoutMilliseconds: TIMEOUT,
        },
      });
      const azureAllHostsQuery = queryExecutionClient.queryExecute({
        body: {
          //get all Azure hosts
          query: `fetch dt.entity.azure_vm
              //| fieldsAdd detectedName, ipAddress = ipAddress[0]
              | summarize count=count()`,
          requestTimeoutMilliseconds: TIMEOUT,
        },
      });
      const azureUnmonitoredHostsQuery = queryExecutionClient.queryExecute({
        body: {
          //get all Azure hosts w/o OneAgent
          // query: `fetch dt.entity.azure_vm
          //     | filterOut in(id,entitySelector("type(azure_vm),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
          //     | fieldsAdd entity.detected_name, ipAddress = ipAddress[0]`,
          query: `fetch dt.entity.azure_vm
          | fieldsAdd host=runs[dt.entity.host], entity.detected_name, ipAddress 
          | lookup [fetch dt.entity.host | fieldsAdd isMonitoringCandidate], sourceField:host, lookupField:id, prefix:"host."
          | filterOut host.isMonitoringCandidate == false 
          | fields id, entity.name, entity.detected_name, ipAddress`,
          requestTimeoutMilliseconds: TIMEOUT,
        },
      });
      const gcpAllHostsQuery = gcpValid
        ? queryExecutionClient.queryExecute({
            body: {
              //get all gcp hosts
              query: GCP_ALL_HOSTS_QUERY,
              requestTimeoutMilliseconds: TIMEOUT,
            },
          })
        : Promise.resolve({ state: "CANCELLED" } as QueryStartResponse);
      const gcpUnmonitoredHostsQuery = gcpValid
        ? queryExecutionClient.queryExecute({
            body: {
              //get all gcp hosts w/o OneAgent
              query: GCP_UNMONITORED_HOSTS_QUERY,
              requestTimeoutMilliseconds: TIMEOUT,
            },
          })
        : Promise.resolve({ state: "CANCELLED" } as QueryStartResponse);
      const vmwareAllHostsQuery = queryExecutionClient.queryExecute({
        body: {
          //get all vmware hosts
          query: `fetch dt.entity.virtualmachine
              //| fieldsAdd ip = ipAddress[0]
              //| fields id, entityName, ipAddress=ip
              //| limit 100000
              | summarize count=count()`,
          requestTimeoutMilliseconds: TIMEOUT,
        },
      });
      const vmwareUnmonitoredHostsQuery = queryExecutionClient.queryExecute({
        body: {
          //get all vmware hosts w/o OneAgent
          // query: `fetch dt.entity.virtualmachine
          //     | fieldsAdd ip = ipAddress[0]
          //     | lookup [fetch dt.entity.host | filter in(id,entitySelector("type(host),fromRelationships.runsOn(type(virtualmachine))")) | fieldsAdd ip = ipAddress[0]], lookupField: ip, sourceField:ip
          //     | filter isNull(lookup.ip)
          //     | fields id, entity.name, ipAddress=ip
          //     | limit 100000`,
          query: `fetch dt.entity.virtualmachine
          | fieldsAdd ip = ipAddress[0]
          | lookup [fetch dt.entity.host 
            | filter in(id,entitySelector("type(host),fromRelationships.runsOn(type(virtualmachine))")) 
            | fieldsAdd ip = ipAddress[0]], lookupField: ip, sourceField:ip
          | filter isNull(lookup.ip)
          | fields id, entity.name, ipAddress=ip
          | limit 100000`,
          requestTimeoutMilliseconds: TIMEOUT,
        },
      });

      //Update clouds with query data
      oneAgentHostsQuery.then((res) => {
        //   console.log("oneAgentHostsQuery:", res.result?.records);
        if (res.result?.records) {
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            res.result?.records?.forEach((r) => {
              // const vals = r?.values || {};
              // debugger;
              switch (r?.cloud) {
                case "EC2":
                  {
                    const nc = newClouds.find((c) => c.cloudType == "EC2");
                    if (nc) nc.oneagentHosts = Number(r?.count);
                  }
                  break;
                case "GOOGLE_CLOUD_PLATFORM":
                  {
                    const nc = newClouds.find((c) => c.cloudType == "GOOGLE_CLOUD_PLATFORM");
                    if (nc) nc.oneagentHosts = Number(r?.count);
                  }
                  break;
                case "AZURE":
                  {
                    const nc = newClouds.find((c) => c.cloudType == "AZURE");
                    if (nc) nc.oneagentHosts = Number(r?.count);
                  }
                  break;
                case "VMWare":
                  {
                    const nc = newClouds.find((c) => c.cloudType == "VMWare");
                    if (nc) nc.oneagentHosts = Number(r?.count);
                  }
                  break;
              }
            });
            return newClouds;
          });
        }
        // if (res.error) {
        //   toastError(res.error);
        // }
      });
      awsAllHostsQuery.then(
        (res) => {
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds];
            const nc = newClouds.find((c) => c.cloudType == "EC2");
            if (nc && Array.isArray(res.result?.records)) {
              const num = res.result?.records[0]?.count as number;
              nc.cloudHosts = num;
              if (num != null && !isNaN(num)) nc.cloudStatus = true;
              else nc.cloudStatus = false;
            }
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      awsUnmonitoredHostsQuery.then(
        (res) => {
          //   console.log("awsHostsQuery:", res.result?.records);
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            const nc = newClouds.find((c) => c.cloudType == "EC2");
            if (nc) nc.unmonitoredCloud = res.result?.records as UnmonitoredCloud[];
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      azureAllHostsQuery.then(
        (res) => {
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds];
            const nc = newClouds.find((c) => c.cloudType == "AZURE");
            if (nc && Array.isArray(res.result?.records)) {
              const num = res.result?.records[0]?.count as number;
              nc.cloudHosts = num;
              if (num != null && !isNaN(num)) nc.cloudStatus = true;
              else nc.cloudStatus = false;
            }
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      azureUnmonitoredHostsQuery.then(
        (res) => {
          //   console.log("azureHostsQuery:", res.result?.records);
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            const nc = newClouds.find((c) => c.cloudType == "AZURE");
            if (nc) nc.unmonitoredCloud = res.result?.records as UnmonitoredCloud[];
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      gcpAllHostsQuery.then(
        (res) => {
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds];
            const nc = newClouds.find((c) => c.cloudType == "GOOGLE_CLOUD_PLATFORM");
            if (nc && Array.isArray(res.result?.records)) {
              const num = res.result?.records[0]?.count as number;
              nc.cloudHosts = num;
              if (num != null && !isNaN(num)) nc.cloudStatus = true;
              else nc.cloudStatus = false;
            }
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      gcpUnmonitoredHostsQuery.then(
        (res) => {
          //   console.log("gcpHostsQuery:", res.result?.records);
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            const nc = newClouds.find((c) => c.cloudType == "GOOGLE_CLOUD_PLATFORM");
            if (nc) nc.unmonitoredCloud = res.result?.records as UnmonitoredCloud[];
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      vmwareAllHostsQuery.then(
        (res) => {
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds];
            const nc = newClouds.find((c) => c.cloudType == "VMWare");
            if (nc && Array.isArray(res.result?.records)) {
              const num = res.result?.records[0]?.count as number;
              nc.cloudHosts = num;
              if (num != null && !isNaN(num)) nc.cloudStatus = true;
              else nc.cloudStatus = false;
            }
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      vmwareUnmonitoredHostsQuery.then(
        (res) => {
          //   console.log("vmwareHostsQuery:", res.result?.records);
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            const nc = newClouds.find((c) => c.cloudType == "VMWare");
            if (nc) nc.unmonitoredCloud = res.result?.records as UnmonitoredCloud[];
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      Promise.allSettled([
        oneAgentHostsQuery,
        awsAllHostsQuery,
        awsUnmonitoredHostsQuery,
        azureAllHostsQuery,
        azureUnmonitoredHostsQuery,
        gcpAllHostsQuery,
        gcpUnmonitoredHostsQuery,
        vmwareAllHostsQuery,
        vmwareUnmonitoredHostsQuery,
      ]).then((results) => {
        console.log("fetchQueries complete:", results);
        setRunningDQL(false);
      });
    } catch (e) {
      toastError(e);
    }
  };

  return { realCloudData, fetchQueries, runningDQL };
};
