import React, { useMemo, useState } from 'react';
import {
  DataTable,
  Menu,
  Button,
  IntentButton,
  ProgressCircle,
  Text,
  TableColumn,
} from '@dynatrace/strato-components-preview';
import { DotMenuIcon } from '@dynatrace/strato-icons';
import { CloudType } from '../types/CloudTypes';
import { OneAgentIcon } from '../icons/OneAgent';
import { useUnmonitoredHosts } from '../hooks/useUnmonitoredHosts';
import { Indicator } from './Indicator';
import { InstallOneAgentModal } from './modals/InstallOneAgentModal';

type HostTableProps = { type: CloudType };

export const HostsTable = ({ type }: HostTableProps) => {
  const { isLoading, isError, data } = useUnmonitoredHosts(type);
  const [modalOpen, setModalOpen] = useState(false);
  const [ips, setIps] = useState('');

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        accessor: 'id',
        header: 'Entity ID',
        ratioWidth: 1,
        cell: ({ row }) => {
          return <IntentButton payload={{ 'dt.entity.host': row.original.id }}>{row.original.id}</IntentButton>;
        },
      },
      { accessor: "'entity.name'", header: 'Entity Name', ratioWidth: 1, },
      { accessor: "'entity.detected_name'", header: 'Detected Name', ratioWidth: 1, },
      { accessor: 'ipAddress', header: 'IP Address', ratioWidth: 0.6, },
      {
        header: ' ',
        id: 'ellipsis',
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
                    setIps(row.original.ipAddress);
                    setModalOpen(true);
                  }}
                >
                  <Menu.ItemIcon>
                    <OneAgentIcon />
                  </Menu.ItemIcon>
                  Install OneAgent
                </Menu.Item>
              </Menu.Content>
            </Menu></DataTable.Cell>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) {
    return <ProgressCircle size='small' aria-label='Loading...' />;
  }

  if (isError) {
    return <Indicator state='critical'>There was an error fetching unmonitored hosts</Indicator>;
  }

  return data.length > 0 ? (
    <>
      <DataTable data={data} columns={columns} resizable>
        <DataTable.Pagination />
      </DataTable>
      <InstallOneAgentModal modalOpen={modalOpen} onDismiss={() => setModalOpen(false)} ips={ips} cloudType={type} />
    </>
  ) : (
    <Text>No unmonitored hosts detected. Connect additional clouds.</Text>
  );
};
