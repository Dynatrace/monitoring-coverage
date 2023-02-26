import { RecordV2Beta, RecordV2BetaValues } from "@dynatrace-sdk/client-query-v02";

interface UnmonitoredCloudValues extends RecordV2BetaValues {
  entityId: string;
  entityName: string;
  detectedName: string;
  ipAddress: string;
}

interface UnmonitoredCloud extends RecordV2Beta {
  values: UnmonitoredCloudValues | null;
}

interface Cloud {
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

export { Cloud, UnmonitoredCloud };
