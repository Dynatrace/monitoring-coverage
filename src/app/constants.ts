import { getEnvironmentUrl } from '@dynatrace-sdk/app-environment';
import { Cloud } from './types/CloudTypes';

// intermediate solution to get the 2nd gen url associated with a 3rd gen environment
export const GEN2URL = getEnvironmentUrl().replace(/\.apps/, '');

export const CLOUDS: Cloud[] = [
  {
    cloudType: 'EC2',
    metricKey: 'dt.cloud.aws.ec2.cpu.usage',
    icon: 'aws.svg',
    cloud: 'AWS',
    setupPath: '/#settings/awsmonitoring',
  },
  {
    cloudType: 'AZURE',
    metricKey: 'dt.cloud.azure.vm.cpu_usage',
    icon: 'azure.svg',
    cloud: 'Azure',
    setupPath: '/#settings/azuremonitoring',
  },
  {
    cloudType: 'GOOGLE_CLOUD_PLATFORM',
    metricKey: 'cloud.gcp.compute_googleapis_com.guest.cpu.usage_time',
    icon: 'gcp.svg',
    cloud: 'Google Cloud Platform',
    setupPath: '/ui/hub/technologies/google-cloud-platform',
  },
  {
    cloudType: 'VMWare',
    metricKey: 'dt.cloud.vmware.vm.cpu.usage',
    icon: 'vm.svg',
    cloud: 'VM Ware',
    setupPath: '/#settings/vmwaremonitoring',
  },
];

export const VMWARE_SETTINGS_SCHEMA = "builtin:virtualization.vmware";
