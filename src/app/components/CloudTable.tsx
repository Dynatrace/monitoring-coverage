import React, { useState, useMemo } from 'react';
import {
  DataTable,
  Flex,
  Button,
  TableColumn,
  Menu,
  TABLE_EXPANDABLE_DEFAULT_COLUMN,
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
      { ...TABLE_EXPANDABLE_DEFAULT_COLUMN, maxWidth: 40, autoWidth: true },
      {
        header: 'Cloud provider',
        id: 'cloud',
        width: 190,
        autoWidth: true,
        cell: ({ row }) => {
          return (
            <DataTable.Cell>
              <Flex>
                <img
                  src={`./assets/${row.original.icon}`}
                  style={{ height: Spacings.Size20, width: Spacings.Size20 }}
                />
                <span>{row.original.cloud}</span>
              </Flex>
            </DataTable.Cell>
          );
        },
      },
      {
        header: 'Cloud status',
        id: 'status',
        width: 130,
        autoWidth: true,
        cell: ({ row }) => {
          return (
            <DataTable.Cell>
              <StatusCell type={row.original.cloudType} />
            </DataTable.Cell>
          );
        },
      },
      {
        header: 'Cloud hosts',
        id: 'hosts',
        minWidth: 100,
        autoWidth: true,
        alignment: 'right',
        cell: ({ row }) => {
          return (
            <DataTable.Cell>
              <HostsCell type={row.original.cloudType} />
            </DataTable.Cell>
          );
        },
      },
      {
        accessor: 'oneagentHosts',
        header: 'OneAgent hosts',
        alignment: 'right',
        minWidth: 140,
        autoWidth: true,
        cell: ({ row }) => {
          return (
            <DataTable.Cell>
              <OneAgentHostsCell type={row.original.cloudType} />
            </DataTable.Cell>
          );
        },
      },
      {
        header: 'OneAgent coverage',
        id: 'coverage',
        alignment: 'right',
        minWidth: 120,
        autoWidth: true,
        cell: ({ row }) => {
          return (
            <DataTable.Cell>
              <OneAgentCoverageCell type={row.original.cloudType} />
            </DataTable.Cell>
          );
        },
      },
      {
        header: 'Priority',
        id: 'priority',
        minWidth: 100,
        autoWidth: true,
        cell: ({ row }) => {
          return (
            <DataTable.Cell>
              <PriorityCell type={row.original.cloudType} />
            </DataTable.Cell>
          );
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        alignment: 'center',
        width: 190,
        autoWidth: true,
        cell: ({ row }) => {
          return (
            <DataTable.Cell>
              <ActionsCell
                type={row.original.cloudType}
                onClick={(action) => {
                  setSelectedCloud(row.original);
                  setModalOpen(action);
                }}
              />
            </DataTable.Cell>
          );
        },
      },
      {
        header: ' ',
        id: 'ellipsis',
        alignment: 'center',
        width: 40,
        maxWidth: 40,
        minWidth: 40,
        autoWidth: true,
        cell: ({ row }) => {
          return (
            <DataTable.Cell>
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
            </DataTable.Cell>
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
