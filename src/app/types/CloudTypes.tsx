import { ResultRecord } from "@dynatrace-sdk/client-query";

export interface UnmonitoredCloud extends ResultRecord {
  id: string;
  "entity.name": string;
  "entity.detected_name": string;
  ipAddress: string;
}

export const UnmonitoredCloudCols = [
  {
    accessor: "id",
    header: "Entity ID",
  },
  { accessor: "'entity.name'", header: "Entity Name" },
  { accessor: "'entity.detected_name'", header: "Detected Name" },
  { accessor: "ipAddress", header: "IP Address" },
] as const;

export interface Cloud {
  cloudType: "EC2" | "GOOGLE_CLOUD_PLATFORM" | "VMWare" | "AZURE";
  metricKey?: string;
  icon: string;
  cloud: string;
  cloudStatus: boolean;
  cloudHosts: number;
  oneagentHosts: number;
  unmonitoredCloud: UnmonitoredCloud[];
  setupPath: string;
}
