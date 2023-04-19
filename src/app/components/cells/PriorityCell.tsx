import React from 'react';
import { CloudHostStatus, CloudType } from '../../types/CloudTypes';
import { useHostsStatus } from '../../hooks/useHostsStatus';
import { ErrorIcon } from '@dynatrace/strato-icons';
import { format, units } from '@dynatrace-sdk/util-formatters';
import { Indicator } from '../Indicator';
import { useOneAgentHosts } from 'src/app/hooks/useOneAgentHosts';
import { coverageRatio } from './coverage-ratio';



type PriorityCellProps = {
  type: CloudType;
};

export const PriorityCell = ({ type }: PriorityCellProps) => {
  const status = useHostsStatus(type);
  const oneagent = useOneAgentHosts();

  const isLoading = status.isLoading || oneagent.isLoading;
  const isError = status.isError || oneagent.isError;

  if (isLoading) return null;

  if (isError) return <ErrorIcon />;

  const oneagentHosts = oneagent.data[type];

  const coverage = coverageRatio(status.data, oneagentHosts);
  if (status.data.status && oneagentHosts !== null && oneagentHosts > 0)
    return <Indicator state="critical">Critical</Indicator>;
  if (coverage > 100) return <Indicator state="critical">Critical</Indicator>;
  if (coverage == 100) return <>-</>;
  if (coverage >= 90) return <>Low</>;
  if (coverage > 70) return <>Medium</>;
  if (coverage >= 0) return <Indicator state="warning">High</Indicator>;
  return <>-</>;
};
