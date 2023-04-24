import { useQuery } from '@tanstack/react-query';
import {
  GetAgentInstallerMetaInfoPathInstallerType,
  GetAgentInstallerMetaInfoPathOsType,
  GetAgentInstallerMetaInfoQueryArch,
  GetAgentInstallerMetaInfoQueryBitness,
  GetAgentInstallerMetaInfoQueryFlavor,
  deploymentClient,
} from '@dynatrace-sdk/client-classic-environment-v1';
import { Meta } from '../types/Meta';

type OneAgentInstallerMetaInfoConfig = {
  osType: GetAgentInstallerMetaInfoPathOsType;
  installerType: GetAgentInstallerMetaInfoPathInstallerType;
  flavor?: GetAgentInstallerMetaInfoQueryFlavor;
  arch?: GetAgentInstallerMetaInfoQueryArch;
  bitness?: GetAgentInstallerMetaInfoQueryBitness;
};

type OneAgentInstallerMetaInfoParams = Pick<
  Partial<OneAgentInstallerMetaInfoConfig>,
  'osType' | 'installerType' | 'arch'
>;

async function fetcher(params: OneAgentInstallerMetaInfoParams) {
  const {
    osType = GetAgentInstallerMetaInfoPathOsType.Unix,
    installerType = GetAgentInstallerMetaInfoPathInstallerType.Default,
    arch = GetAgentInstallerMetaInfoQueryArch.All,
  } = params;

  const config: OneAgentInstallerMetaInfoConfig = {
    osType,
    installerType,
    arch,
  };

  return deploymentClient.getAgentInstallerMetaInfo(config).then((value) => {
    return value.latestAgentVersion || '';
  });
}

export function useOneAgentInstallerMeta(params: OneAgentInstallerMetaInfoParams) {
  const meta: Meta = {
    errorTitle: 'Fetch installer meta info failed',
  };

  return useQuery({
    queryFn: () => fetcher(params),
    queryKey: ['one-agent-installer-meta', params],
    meta,
  });
}
