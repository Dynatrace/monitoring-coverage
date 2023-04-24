import React from 'react';
import { CloudType } from '../../types/CloudTypes';
import { useHostsStatus } from '../../hooks/useHostsStatus';
import { LoadingIndicator } from '@dynatrace/strato-components-preview';
import { ErrorIcon } from '@dynatrace/strato-icons';
import { format } from '@dynatrace-sdk/util-formatters';

type HostsCellProps = {
  type: CloudType;
};

export const HostsCell = ({ type }: HostsCellProps) => {
  const { data, isLoading, isError } = useHostsStatus(type);

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorIcon />;

  return <>{data.hosts !== undefined ? format(data.hosts) : '-'}</>;
};
