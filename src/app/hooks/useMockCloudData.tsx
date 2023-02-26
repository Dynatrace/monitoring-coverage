import React, { useEffect, useMemo, useState } from "react";
import { Cloud } from "../types/CloudTypes";

const DEFAULT_MOCK_CLOUDS = [
  {
    cloudType: "EC2",
    icon: "aws.svg",
    cloud: "AWS",
    cloudStatus: true,
    cloudHosts: 1000,
    oneagentHosts: 900,
  },
  {
    cloudType: "AZURE",
    icon: "azure.svg",
    cloud: "Azure",
    cloudStatus: false,
    cloudHosts: null,
    oneagentHosts: 123,
  },
  {
    cloudType: "GOOGLE_CLOUD_PLATFORM",
    icon: "gcp.svg",
    cloud: "Google Cloud Platform",
    cloudStatus: true,
    cloudHosts: 100,
    oneagentHosts: 99,
  },
  {
    cloudType: "VMWare",
    icon: "vm.svg",
    cloud: "VM Ware",
    cloudStatus: true,
    cloudHosts: 506,
    oneagentHosts: 202,
  },
] as Cloud[];

const generateHostData = (count) => {
  const hosts: unknown[] = [];
  for (let i = 0; i < count; i++) {
    hosts.push({
      entityId: `CLOUDHOST-` + i.toString().padStart(7, "0"),
      entityName: `cloud_` + i.toString().padStart(3, "0"),
      detectedName: `cloud_` + i.toString().padStart(3, "0"),
      ipAddress: `10.0.0.` + i,
    });
  }
  return hosts;
};

export const useMockCloudData = () => {
  const [mockCloudData, setMockCloudData] = useState(DEFAULT_MOCK_CLOUDS);

  useEffect(() => {
    setMockCloudData((oldval) => {
      const newval = [...oldval];
      newval.forEach((cloud) => (cloud.unmonitoredCloud = generateHostData(cloud.cloudHosts - cloud.oneagentHosts)));
      return newval;
    });
  }, []);

  return { mockCloudData, setMockCloudData };
};
