import React from 'react';
import { CloudType } from '../../types/CloudTypes';
import { useHostsStatus } from '../../hooks/useHostsStatus';
import { ProgressCircle, Text } from '@dynatrace/strato-components-preview';
import { ErrorIcon, SyncDoneIcon, SyncOffIcon } from '@dynatrace/strato-icons';
import { Indicator } from '../Indicator';
import { useOneAgentHosts } from 'src/app/hooks/useOneAgentHosts';

type StatusCellProps = {
  type: CloudType;
};

export const StatusCell = ({ type }: StatusCellProps) => {
  const { data, isLoading, isError } = useHostsStatus(type);
  const { data: oneagentHosts } = useOneAgentHosts();

  if (isLoading) return (
    <ProgressCircle
      size="small"
      /*TODO: Add a meaningful aria-label for the ProgressCircle element.*/
      aria-label="Description of the ProgressCircle." />
  );

  if (isError) return <ErrorIcon />;

  if (data.status) {
    return (
      <Indicator state='neutral'>
        <SyncDoneIcon />
        <span>Connected</span>
      </Indicator>
    );
  }
  if (oneagentHosts !== undefined) {
    const oneagentHostsForType = oneagentHosts[type];
    const state = oneagentHostsForType !== null && oneagentHostsForType > 0 ? 'critical' : 'neutral';
    return (
      <Indicator state={state}>
        <SyncOffIcon />
        <span>Not setup</span>
      </Indicator>
    );
  }
  return null;
};