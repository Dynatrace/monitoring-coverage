import { RecordV2Beta, RecordV2BetaValues } from "@dynatrace-sdk/client-query-v02";
import { ResultRecord } from "@dynatrace-sdk/client-query";
import { convertToColumnsFromWellFormedArray, TableColumn } from "@dynatrace/strato-components-preview";

// interface UnmonitoredCloudValues extends RecordV2BetaValues {
//   id: string;
//   'entity.name': string;
//   'entity.detected_name': string;
//   ipAddress: string;
// }

// interface UnmonitoredCloud extends RecordV2Beta {
//   values: UnmonitoredCloudValues | null;
// }

interface UnmonitoredCloud extends ResultRecord {
  id: string;
  'entity.name': string;
  'entity.detected_name': string;
  ipAddress: string;
}

const UnmonitoredCloudCols = [
  {
    accessor: "id",
    header: "Entity ID",
  },
  { accessor: "'entity.name'", header: "Entity Name" },
  { accessor: "'entity.detected_name'", header: "Detected Name" },
  { accessor: "ipAddress", header: "IP Address" },
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
