import { CloudHostStatus } from 'src/app/types/CloudTypes';

export function coverageRatio({ status, hosts }: CloudHostStatus, oneagentHosts: number | null) {
  return status ? Math.floor(((oneagentHosts || 0) / (hosts || 0)) * 100) : NaN;
}
