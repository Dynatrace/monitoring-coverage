import { ResultRecord } from '@dynatrace-sdk/client-query';

export interface UnmonitoredCloud extends ResultRecord {
  'id': string;
  'entity.name': string;
  'entity.detected_name': string;
  'ipAddress': string;
}

export type CloudHostStatus = { hosts?: number; status?: boolean };

export type CloudType = 'EC2' | 'GOOGLE_CLOUD_PLATFORM' | 'VMWare' | 'AZURE';

export interface Cloud {
  cloudType: CloudType;
  metricKey?: string;
  icon: string;
  cloud: string;
  setupPath: string;
}

export interface VmwareSetting {
  enabled: boolean;
  label: string;
  ipaddress: string;
  username: string;
  password?: string;
}
