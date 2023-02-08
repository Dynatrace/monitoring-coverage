import React, { useMemo } from "react";
import { Cloud } from "../types/CloudTypes";

export const useMockCloudData = () => {
  const data = useMemo(() => {
    return [
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
  }, []);

  return { data };
};
