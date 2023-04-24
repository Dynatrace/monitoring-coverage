import React from 'react';
import { CloudType } from '../../types/CloudTypes';
import { useHostsStatus } from '../../hooks/useHostsStatus';
import { ErrorIcon } from '@dynatrace/strato-icons';
import { format, units } from '@dynatrace-sdk/util-formatters';
import { Indicator } from '../Indicator';
import { useOneAgentHosts } from 'src/app/hooks/useOneAgentHosts';
import { coverageRatio } from './coverage-ratio';

type OneAgentCoverageCellProps = {
  type: CloudType;
};

export const OneAgentCoverageCell = ({ type }: OneAgentCoverageCellProps) => {
  const status = useHostsStatus(type);
  const oneagent = useOneAgentHosts();

  const isLoading = status.isLoading || oneagent.isLoading;
  const isError = status.isError || oneagent.isError;

  if (isLoading) return null;

  if (isError) return <ErrorIcon />;

  const coverage = coverageRatio(status.data, oneagent.data[type]);
  if (coverage > 100) return <Indicator state='critical'>&gt; 100%</Indicator>;
  if (coverage == 100) return <Indicator state='success'>100%</Indicator>;
  if (!isNaN(coverage) && coverage < 90)
    return <Indicator state='warning'>{format(coverage, { input: units.percentage.percent })}</Indicator>;
  if (!isNaN(coverage)) return <>{format(coverage, { input: units.percentage.percent })}</>;
  return <>-</>;
};
