import React, { useEffect, useMemo, useState } from "react";
import { ErrorV2Beta, queryClient, QueryResponseV2Beta, RecordV2Beta } from "@dynatrace-sdk/client-query-v02";
import { useToastNotification } from "@dynatrace/strato-components-preview";
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

export const useRealCloudData = () => {
  const [realCloudData, setRealCloudData] = useState<Cloud[]>(CLOUDSTUB);
  // const [error, toastError] = useState();
  const [runningDQL, setRunningDQL] = useState<boolean>(false);
  const { showToast } = useToastNotification();

  const toastError = (error) => {
    showToast({
      title: "Error getting cloud data with DQL",
      type: "warning",
      message: error.message,
    });
  };

  //when getData becomes true, fire DQL queries
  const fetchQueries = () => {
    try {
      setRunningDQL(true);
      const oneAgentHostsQuery = queryClient.query({
        //get the number of hosts with OneAgents, split by cloud
        query: `fetch dt.entity.host
              | filter cloudType <> "" OR hypervisorType == "VMWARE"
              | fieldsAdd cloud = if(cloudType <> "", cloudType, else:"VMWare")
              | summarize by:{cloud}, count()`,
      });
      // const cloudHostsQuery = queryClient.query({
      //   query: `fetch metrics
      //         | filter in(metric.key,"dt.cloud.aws.ec2.cpu.usage","dt.cloud.azure.vm.cpu_usage","cloud.gcp.compute_googleapis_com.guest.cpu.usage_time","dt.cloud.vmware.vm.cpu.usage")
      //         | fieldsAdd entityId = if(dt.source_entity<>"",
      //         dt.source_entity,
      //         else: if(dt.entity.azure_vm<>"",dt.entity.azure_vm,else:\`dt.entity.cloud:gcp:gce_instance\`))
      //         | summarize by:{metric.key,entityId}, count()
      //         | summarize by:metric.key, count()`,
      // });
      const awsAllHostsQuery = queryClient.query({
        //get all AWS hosts
        query: `fetch dt.entity.EC2_INSTANCE
              | filter arn != ""
              //| fieldsAdd detectedName, ipAddress = localIp
              | summarize count(), alias:num`,
      });
      const awsUnmonitoredHostsQuery = queryClient.query({
        //get all AWS hosts w/o OneAgent
        query: `fetch dt.entity.EC2_INSTANCE
              | filterOut in(entityId,entitySelector("type(EC2_INSTANCE),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
              | fieldsAdd detectedName, ipAddress = localIp`,
      });
      const azureAllHostsQuery = queryClient.query({
        //get all Azure hosts
        query: `fetch dt.entity.azure_vm
              //| fieldsAdd detectedName, ipAddress = ipAddress[0]
              | summarize count(), alias:num`,
      });
      const azureUnmonitoredHostsQuery = queryClient.query({
        //get all Azure hosts w/o OneAgent
        query: `fetch dt.entity.azure_vm
              | filterOut in(entityId,entitySelector("type(azure_vm),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
              | fieldsAdd detectedName, ipAddress = ipAddress[0]`,
      });
      const gcpAllHostsQuery = queryClient.query({
        //get all gcp hosts
        query: `fetch \`dt.entity.cloud:gcp:gce_instance\`
              //| fieldsAdd ipAddress
              | summarize count(), alias:num`,
      });
      const gcpUnmonitoredHostsQuery = queryClient.query({
        //get all gcp hosts w/o OneAgent
        query: `fetch \`dt.entity.cloud:gcp:gce_instance\`
              | lookup [fetch \`dt.entity.host\` 
              | filter gceInstanceId <> "" 
              | fieldsAdd instance_id=gceInstanceId], lookupField: gceInstanceId, sourceField:entityName
              | filter isNull(lookup.entityId)
              //| fieldsAdd ipAddress`,
      });
      const vmwareAllHostsQuery = queryClient.query({
        //get all vmware hosts
        query: `fetch dt.entity.virtualmachine
              //| fieldsAdd ip = ipAddress[0]
              //| fields entityId, entityName, ipAddress=ip
              //| limit 100000
              | summarize count(), alias:num`,
      });
      const vmwareUnmonitoredHostsQuery = queryClient.query({
        //get all vmware hosts w/o OneAgent
        query: `fetch dt.entity.virtualmachine
              | fieldsAdd ip = ipAddress[0]
              | lookup [fetch dt.entity.host | filter in(entityId,entitySelector("type(host),fromRelationships.runsOn(type(virtualmachine))")) | fieldsAdd ip = ipAddress[0]], lookupField: ip, sourceField:ip
              | filter isNull(lookup.ip)
              | fields entityId, entityName, ipAddress=ip
              | limit 100000`,
      });

      //Update clouds with query data
      oneAgentHostsQuery.then((res) => {
        //   console.log("oneAgentHostsQuery:", res.records);
        if (res.records) {
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            res.records?.forEach((r) => {
              const vals = r.values || {};
              switch (vals.cloud) {
                case "EC2":
                  {
                    const nc = newClouds.find((c) => c.cloudType == "EC2");
                    if (nc) nc.oneagentHosts = Number(vals["count()"]);
                  }
                  break;
                case "GOOGLE_CLOUD_PLATFORM":
                  {
                    const nc = newClouds.find((c) => c.cloudType == "GOOGLE_CLOUD_PLATFORM");
                    if (nc) nc.oneagentHosts = Number(vals["count()"]);
                  }
                  break;
                case "AZURE":
                  {
                    const nc = newClouds.find((c) => c.cloudType == "AZURE");
                    if (nc) nc.oneagentHosts = Number(vals["count()"]);
                  }
                  break;
                case "VMWare":
                  {
                    const nc = newClouds.find((c) => c.cloudType == "VMWare");
                    if (nc) nc.oneagentHosts = Number(vals["count()"]);
                  }
                  break;
              }
            });
            return newClouds;
          });
        }
        if (res.error) {
          toastError(res.error);
        }
      });
      // cloudHostsQuery.then(
      //   (res) => {
      //     //   console.log("cloudHostsQuery:", res.records);
      //     setRealCloudData((oldClouds) => {
      //       const newClouds = [...oldClouds]; //new object to update state
      //       res.records?.forEach((r) => {
      //         const vals = r.values || {};
      //         switch (vals["metric.key"]) {
      //           case "dt.cloud.aws.ec2.cpu.usage":
      //             {
      //               const nc = newClouds.find((c) => c.metricKey == "dt.cloud.aws.ec2.cpu.usage");
      //               const num = Number(vals["count()"]);
      //               if (nc) {
      //                 nc.cloudHosts = num;
      //                 if (num != null && !isNaN(num)) nc.cloudStatus = true;
      //               }
      //             }
      //             break;
      //           case "dt.cloud.azure.vm.cpu_usage":
      //             {
      //               const nc = newClouds.find((c) => c.metricKey == "dt.cloud.azure.vm.cpu_usage");
      //               const num = Number(vals["count()"]);
      //               if (nc) {
      //                 nc.cloudHosts = num;
      //                 if (num != null && !isNaN(num)) nc.cloudStatus = true;
      //               }
      //             }
      //             break;
      //           case "cloud.gcp.compute_googleapis_com.guest.cpu.usage_time":
      //             {
      //               const nc = newClouds.find(
      //                 (c) => c.metricKey == "cloud.gcp.compute_googleapis_com.guest.cpu.usage_time"
      //               );
      //               const num = Number(vals["count()"]);
      //               if (nc) {
      //                 nc.cloudHosts = num;
      //                 if (num != null && !isNaN(num)) nc.cloudStatus = true;
      //               }
      //             }
      //             break;
      //           case "dt.cloud.vmware.vm.cpu.usage":
      //             {
      //               const nc = newClouds.find((c) => c.metricKey == "dt.cloud.vmware.vm.cpu.usage");
      //               const num = Number(vals["count()"]);
      //               if (nc) {
      //                 nc.cloudHosts = num;
      //                 if (num != null && !isNaN(num)) nc.cloudStatus = true;
      //               }
      //             }
      //             break;
      //         }
      //       });
      //       return newClouds;
      //     });
      //   },
      //   (e) => toastError(e)
      // );
      awsAllHostsQuery.then(
        (res) => {
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds];
            const nc = newClouds.find((c) => c.cloudType == "EC2");
            if (nc && Array.isArray(res.records)) {
              const num = res.records[0].values?.num as number;
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
          //   console.log("awsHostsQuery:", res.records);
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            const nc = newClouds.find((c) => c.cloudType == "EC2");
            if (nc) nc.unmonitoredCloud = res.records as UnmonitoredCloud[];
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
            if (nc && Array.isArray(res.records)) {
              const num = res.records[0].values?.num as number;
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
          //   console.log("azureHostsQuery:", res.records);
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            const nc = newClouds.find((c) => c.cloudType == "AZURE");
            if (nc) nc.unmonitoredCloud = res.records as any[];
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
            if (nc && Array.isArray(res.records)) {
              const num = res.records[0].values?.num as number;
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
          //   console.log("gcpHostsQuery:", res.records);
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            const nc = newClouds.find((c) => c.cloudType == "GOOGLE_CLOUD_PLATFORM");
            if (nc) nc.unmonitoredCloud = res.records as any[];
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
            if (nc && Array.isArray(res.records)) {
              const num = res.records[0].values?.num as number;
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
          //   console.log("vmwareHostsQuery:", res.records);
          setRealCloudData((oldClouds) => {
            const newClouds = [...oldClouds]; //new object to update state
            const nc = newClouds.find((c) => c.cloudType == "VMWare");
            if (nc) nc.unmonitoredCloud = res.records as any[];
            return newClouds;
          });
        },
        (e) => toastError(e)
      );
      Promise.allSettled([
        oneAgentHostsQuery,
        // cloudHostsQuery,
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
