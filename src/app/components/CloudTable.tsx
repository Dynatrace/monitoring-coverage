import React, { useState, useMemo } from 'react';
import {
  DataTable,
  Flex,
  Button,
  TableColumn,
  Menu,
} from '@dynatrace/strato-components-preview';
import { SyncIcon, DotMenuIcon } from '@dynatrace/strato-icons';
import Spacings from '@dynatrace/strato-design-tokens/spacings';

import { ConnectCloudModal } from './modals/ConnectCloudModal';
import { InstallOneAgentModal } from './modals/InstallOneAgentModal';
import { Cloud } from '../types/CloudTypes';
import { ConnectAWSModal } from './modals/ConnectAWSModal';
import { ConnectAzureModal } from './modals/ConnectAzureModal';
import { ConnectVMWareModal } from './modals/ConnectVMWareModal';
import { HostsTable } from './HostsTable';
import { OneAgentIcon } from '../icons/OneAgent';
import { HostsCell } from './cells/HostsCell';
import { StatusCell } from './cells/StatusCell';
import { OneAgentCoverageCell } from './cells/OneAgentCoverageCell';
import { PriorityCell } from './cells/PriorityCell';
import { ActionsCell } from './cells/ActionsCell';
import { CLOUDS } from '../constants';
import { useUnmonitoredHosts } from '../hooks/useUnmonitoredHosts';
import { OneAgentHostsCell } from './cells/OneAgentHostsCell';

export const CloudTable = () => {
  const [modalOpen, setModalOpen] = useState<'connect-cloud' | 'install-oneagents' | null>(null);
  const [selectedCloud, setSelectedCloud] = useState<Cloud>(CLOUDS[0]);

  const { data: unmonitoredHosts } = useUnmonitoredHosts(selectedCloud?.cloudType);
  const ips = unmonitoredHosts ? unmonitoredHosts.map((host) => host.ipAddress).join(', ') : '';

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        header: 'Cloud provider',
        width: 170,
        cell: ({ row }) => {
          return (
            <Flex>
              <img src={`./assets/${row.original.icon}`} style={{ height: Spacings.Size20, width: Spacings.Size20 }} />
              <span>{row.original.cloud}</span>
            </Flex>
          );
        },
      },
      {
        header: 'Cloud status',
        width: 100,
        cell: ({ row }) => {
          return <StatusCell type={row.original.cloudType} />;
        },
      },
      {
        header: 'Cloud hosts',
        width: 100,
        alignment: 'right',
        cell: ({ row }) => {
          return <HostsCell type={row.original.cloudType} />;
        },
      },
      {
        accessor: 'oneagentHosts',
        header: 'OneAgent hosts',
        alignment: 'right',
        width: 100,
        cell: ({ row }) => {
          return <OneAgentHostsCell type={row.original.cloudType} />;
        },
      },
      {
        header: 'OneAgent coverage',
        alignment: 'right',
        width: 120,
        cell: ({ row }) => {
          return <OneAgentCoverageCell type={row.original.cloudType} />;
        },
      },
      {
        header: 'Priority',
        width: 100,
        cell: ({ row }) => {
          return <PriorityCell type={row.original.cloudType} />;
        },
      },
      {
        header: 'Actions',
        alignment: 'center',
        width: 160,
        cell: ({ row }) => {
          return (
            <ActionsCell
              type={row.original.cloudType}
              onClick={(action) => {
                setSelectedCloud(row.original);
                setModalOpen(action);
              }}
            />
          );
        },
      },
      {
        header: ' ',
        alignment: 'center',
        width: 40,
        cell: ({ row }) => {
          return (
            <Menu>
              <Menu.Trigger>
                <Button aria-label='Open options menu.'>
                  <Button.Prefix>
                    <DotMenuIcon />
                  </Button.Prefix>
                </Button>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item
                  onSelect={() => {
                    setSelectedCloud(row.original);
                    setModalOpen('connect-cloud');
                  }}
                >
                  <Menu.ItemIcon>
                    <SyncIcon />
                  </Menu.ItemIcon>
                  Connect additional cloud
                </Menu.Item>
                <Menu.Item
                  onSelect={() => {
                    setSelectedCloud(row.original);
                    setModalOpen('install-oneagents');
                  }}
                >
                  <Menu.ItemIcon>
                    <OneAgentIcon />
                  </Menu.ItemIcon>
                  Install OneAgents
                </Menu.Item>
              </Menu.Content>
            </Menu>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={CLOUDS}
        fullWidth
        variant={{
          contained: true,
          rowSeparation: 'horizontalDividers',
          verticalDividers: true,
        }}
        resizable
      >
        <DataTable.ExpandableRow>
          {({ row }) => {
            return <HostsTable type={row.cloudType} />;
          }}
        </DataTable.ExpandableRow>
      </DataTable>
      {modalOpen === 'connect-cloud' && selectedCloud && (
        <>
          <ConnectCloudModal
            modalOpen={selectedCloud?.cloudType == 'GOOGLE_CLOUD_PLATFORM'}
            onDismiss={() => setModalOpen(null)}
            selectedCloud={selectedCloud}
          />
          <ConnectAWSModal
            modalOpen={selectedCloud?.cloudType === 'EC2'}
            onDismiss={() => setModalOpen(null)}
            selectedCloud={selectedCloud}
          />
          <ConnectAzureModal
            modalOpen={selectedCloud?.cloudType == 'AZURE'}
            onDismiss={() => setModalOpen(null)}
            selectedCloud={selectedCloud}
          />
          <ConnectVMWareModal
            modalOpen={selectedCloud?.cloudType == 'VMWare'}
            onDismiss={() => setModalOpen(null)}
            selectedCloud={selectedCloud}
          />
        </>
      )}
      {selectedCloud && (
        <InstallOneAgentModal
          modalOpen={modalOpen === 'install-oneagents'}
          onDismiss={() => setModalOpen(null)}
          ips={ips}
          cloudType={selectedCloud.cloudType}
        />
      )}
    </>
  );
};
