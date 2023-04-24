import React from 'react';
import { Cloud } from 'src/app/types/CloudTypes';
import { coverageRatio } from './coverage-ratio';
import { useHostsStatus } from 'src/app/hooks/useHostsStatus';
import { useOneAgentHosts } from 'src/app/hooks/useOneAgentHosts';
import { ErrorIcon, SyncIcon } from '@dynatrace/strato-icons';
import { Button } from '@dynatrace/strato-components-preview';
import { OneAgentIcon } from 'src/app/icons/OneAgent';

type ActionsCellProps = {
  cloud: Cloud;
  setSelectedCloud: React.Dispatch<React.SetStateAction<Cloud>>;
  setOneagentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCloudModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ActionsCell = ({ cloud, setSelectedCloud, setOneagentModalOpen, setCloudModalOpen }: ActionsCellProps) => {
  const status = useHostsStatus(cloud.cloudType);
  const oneagent = useOneAgentHosts();

  const isLoading = status.isLoading || oneagent.isLoading;
  const isError = status.isError || oneagent.isError;

  if (isLoading) return null;

  if (isError) return <ErrorIcon />;

  const coverage = coverageRatio(status.data, oneagent.data[cloud.cloudType]);

  if (!status.data.status || coverage > 100) {
    return (
      <Button
        width={'120px'}
        variant='accent'
        onClick={() => {
          setSelectedCloud(cloud);
          setCloudModalOpen(true);
        }}
      >
        <Button.Prefix>
          <SyncIcon />
        </Button.Prefix>
        Connect cloud
      </Button>
    );
  }
  if (coverage < 100) {
    return (
      <Button
        width={'120px'}
        variant='emphasized'
        onClick={() => {
          setSelectedCloud(cloud);
          setOneagentModalOpen(true);
        }}
      >
        <Button.Prefix>
          <OneAgentIcon />
        </Button.Prefix>
        Install OneAgents
      </Button>
    );
  }
  return <>-</>;
};
