import React, { useEffect, useMemo, useState } from "react";
import { Cloud, UnmonitoredCloud } from "../types/CloudTypes";
import { RecordV2Beta, FieldV2BetaType } from "@dynatrace-sdk/client-query-v02";

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

const generateHostData = (count, entprefix = "CLOUDHOST", nameprefix = "cloud_") => {
  const hosts: UnmonitoredCloud[] = [];
  for (let i = 0; i < count; i++) {
    hosts.push({
        id: entprefix + `-` + i.toString().padStart(7, "0"),
        'entity.name': nameprefix + `_` + i.toString().padStart(3, "0"),
        'entity.detected_name': nameprefix + `_` + i.toString().padStart(3, "0"),
        ipAddress: `10.0.${(i / 254).toFixed(0)}.${(i % 254) + 1}`,
    } as UnmonitoredCloud);
  }
  return hosts;
};

const useMockCloudData = () => {
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

export { useMockCloudData, generateHostData };
