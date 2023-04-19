import React, { useState, useMemo } from "react";
import {
  DataTable,
  Flex,
  Button,
  TableColumn,
  Menu,
  TABLE_EXPANDABLE_DEFAULT_COLUMN,
} from "@dynatrace/strato-components-preview";
import {
  SyncIcon,
  DotMenuIcon,
} from "@dynatrace/strato-icons";
import Spacings from '@dynatrace/strato-design-tokens/spacings';

import { ConnectCloudModal } from "./modals/ConnectCloudModal";
import { InstallOneAgentModal } from "./modals/InstallOneAgentModal";
import { Cloud } from "../types/CloudTypes";
import { ConnectAWSModal } from "./modals/ConnectAWSModal";
import { ConnectAzureModal } from "./modals/ConnectAzureModal";
import { HostsTable } from "./HostsTable";
import { OneAgentIcon } from "../icons/OneAgent";
import { HostsCell } from "./cells/HostsCell";
import { StatusCell } from "./cells/StatusCell";
import { OneAgentCoverageCell } from "./cells/OneAgentCoverageCell";
import { PriorityCell } from "./cells/PriorityCell";
import { ActionsCell } from "./cells/ActionsCell";
import { CLOUDS } from "../constants";
import { useUnmonitoredHosts } from "../hooks/useUnmonitoredHosts";

export const CloudTable = () => {
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [oneagentModalOpen, setOneagentModalOpen] = useState(false);
  const [selectedCloud, setSelectedCloud] = useState<Cloud>(CLOUDS[0]);

  const { data: unmonitoredHosts } = useUnmonitoredHosts(selectedCloud?.cloudType);
  const ips = unmonitoredHosts ? unmonitoredHosts.map((host) => host.ipAddress).join(', ') : '';

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        ...TABLE_EXPANDABLE_DEFAULT_COLUMN,
      },
      {
        header: "Cloud provider",
        width: 170,
        cell: ({ row }) => {
          return (
            <Flex>
              <img
                src={`./assets/${row.original.icon}`}
                style={{ height: Spacings.Size20, width: Spacings.Size20 }}
              />
              <span>{row.original.cloud}</span>
            </Flex>
          );
        },
      },
      {
        header: "Cloud status",
        width: 100,
        cell: ({ row }) => {
          return <StatusCell type={row.original.cloudType} />
        }
      },
      {
        header: "Cloud hosts",
        width: 100,
        cell: ({ row }) => {
          return <HostsCell type={row.original.cloudType} />;
        },
      },
      {
        accessor: "oneagentHosts",
        header: "OneAgent hosts",
        width: 100,
        cell: ({ value }) => {
          return value !== null && !isNaN(value) ? value : "-";
        },
      },
      {
        header: "OneAgent coverage",
        width: 120,
        cell: ({ row }) => {
          return <OneAgentCoverageCell type={row.original.cloudType} />
        },
      },
      {
        header: "Priority",
        width: 100,
        cell: ({ row }) => {
          return <PriorityCell type={row.original.cloudType} />
        },
      },
      {
        header: "Actions",
        width: 170,
        cell: ({ row }) => {
          return <ActionsCell type={row.original.cloudType} onClick={() => {
            setSelectedCloud(row.original);
            setOneagentModalOpen(true);
          }} />
        },
      },
      {
        header: " ",
        alignment: "center",
        width: 40,
        cell: ({ row }) => {
          return (
            <Menu>
              <Menu.Trigger>
                <Button aria-label="Open options menu.">
                  <Button.Prefix>
                    <DotMenuIcon />
                  </Button.Prefix>
                </Button>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item
                  onSelect={() => {
                    setSelectedCloud(row.original);
                    setCloudModalOpen(true);
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
                    setOneagentModalOpen(true);
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
    [open]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={CLOUDS}
        variant={{
          contained: true,
          rowSeparation: "horizontalDividers",
          verticalDividers: true,
        }}
        resizable={true}
      >
        <DataTable.ExpandableRow>
          {({ row }) => {
            console.log(row);
            return <HostsTable type={row.cloudType}/>
          }}
        </DataTable.ExpandableRow>
      </DataTable>
      {cloudModalOpen && selectedCloud && (
        <>
          <ConnectCloudModal
            modalOpen={
              cloudModalOpen &&
              selectedCloud?.cloudType != "EC2" &&
              selectedCloud?.cloudType != "AZURE"
            }
            setModalOpen={setCloudModalOpen}
            selectedCloud={selectedCloud}
          />
          <ConnectAWSModal
            modalOpen={cloudModalOpen && selectedCloud?.cloudType === "EC2"}
            setModalOpen={setCloudModalOpen}
            selectedCloud={selectedCloud}
          />
          <ConnectAzureModal
            modalOpen={cloudModalOpen && selectedCloud?.cloudType == "AZURE"}
            setModalOpen={setCloudModalOpen}
            selectedCloud={selectedCloud}
          />
        </>
      )}
      {oneagentModalOpen && selectedCloud && (
        <InstallOneAgentModal
          modalOpen={oneagentModalOpen}
          setModalOpen={setOneagentModalOpen}
          ips={ips}
        />
      )}
    </>
  );
};
