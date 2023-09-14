import React from 'react';
import { CloudType } from '../../types/CloudTypes';
import { useHostsStatus } from '../../hooks/useHostsStatus';
import { ProgressCircle } from '@dynatrace/strato-components-preview';
import { ErrorIcon } from '@dynatrace/strato-icons';
import { format } from '@dynatrace-sdk/units';

type HostsCellProps = {
  type: CloudType;
};

export const HostsCell = ({ type }: HostsCellProps) => {
  const { data, isLoading, isError } = useHostsStatus(type);

  if (isLoading) return (
    <ProgressCircle
      size="small"
      /*TODO: Add a meaningful aria-label for the ProgressCircle element.*/
      aria-label="Description of the ProgressCircle." />
  );

  if (isError) return <ErrorIcon />;

  return <>{data.hosts !== undefined ? format(data.hosts) : '-'}</>;
};