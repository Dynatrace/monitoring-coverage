import React from 'react';
import { CloudType } from '../../types/CloudTypes';
import { useHostsStatus } from '../../hooks/useHostsStatus';
import { ErrorIcon } from '@dynatrace/strato-icons';
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
  //Critical: we don't know how big the problem even is, because we know there are more clouds than connected
  if (!status.data.status && oneagentHosts !== null && oneagentHosts > 0)
    return <Indicator state='critical'>Critical</Indicator>;
  if (coverage > 100) return <Indicator state='critical'>Critical</Indicator>;
  //Success: we have reached the target of 100%
  if (coverage == 100) return <Indicator state='success'>-</Indicator>;
  //Low/Medium: not perfect, but user making progress
  if (coverage >= 90) return <>Low</>;
  if (coverage > 70) return <>Medium</>;
  //High: user needs to install many oneAgents
  if (coverage >= 0) return <Indicator state='warning'>High</Indicator>;
  //Unknown state: this should not be hit
  return <>-</>;
};
