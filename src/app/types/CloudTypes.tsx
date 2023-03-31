import { RecordV2Beta, RecordV2BetaValues } from "@dynatrace-sdk/client-query-v02";
import { convertToColumnsFromWellFormedArray, TableColumn } from "@dynatrace/strato-components-preview";

interface UnmonitoredCloudValues extends RecordV2BetaValues {
  entityId: string;
  entityName: string;
  detectedName: string;
  ipAddress: string;
}

interface UnmonitoredCloud extends RecordV2Beta {
  values: UnmonitoredCloudValues | null;
}

const UnmonitoredCloudCols = [
  {
    accessor: "values.entityId",
    header: "Entity ID",
  },
  { accessor: "values.entityName", header: "Entity Name" },
  { accessor: "values.detectedName", header: "Detected Name" },
  { accessor: "values.ipAddress", header: "IP Address" },
] as TableColumn[];

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

export { Cloud, UnmonitoredCloud, UnmonitoredCloudCols };
