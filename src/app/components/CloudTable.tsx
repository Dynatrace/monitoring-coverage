import React, { useState, useMemo, useEffect } from "react";
import {
  DataTable,
  Flex,
  Button,
  TableColumn,
  Menu,
  TABLE_EXPANDABLE_DEFAULT_COLUMN,
} from "@dynatrace/strato-components-preview";
import { SyncOffIcon, SyncDoneIcon, SyncIcon, DotMenuIcon } from "@dynatrace/strato-icons";
import { Colors } from "@dynatrace/strato-design-tokens";
import { ConnectCloudModal } from "./ConnectCloudModal";
import { InstallOneagentModal } from "./InstallOneagentModal";
import { Cloud } from "../types/CloudTypes";
import "./CloudTable.css";
import { ConnectAWSModal } from "./ConnectAWSModal";
import { ConnectAzureModal } from "./ConnectAzureModal";
import { HostsTable } from "./HostsTable";

const criticalText = {
  color: Colors.Text.Critical.Default,
};

const warningText = {
  color: Colors.Text.Warning.Default,
};

const coverageRatio = (row) =>
  row.original.cloudStatus ? ((row.original.oneagentHosts || 0) / row.original.cloudHosts) * 100 : NaN;

export const CloudTable = ({
  data,
  apiUrl,
  gen2Url,
  fetchQueries,
  demoMode,
  setMockCloudData,
  configToken,
  getConfigToken,
}: {
  data: Cloud[];
  apiUrl: string;
  gen2Url: string;
  fetchQueries: () => void;
  demoMode: boolean;
  setMockCloudData: React.Dispatch<React.SetStateAction<Cloud[]>>;
  runningDQL: boolean;
  configToken: string | undefined;
  getConfigToken: () => Promise<string>;
}) => {
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [oneagentModalOpen, setOneagentModalOpen] = useState(false);
  const [selectedCloud, setSelectedCloud] = useState<Cloud>();
  const [ips, setIps] = useState<string>("");
  useEffect(() => {
    if (selectedCloud) setIps(selectedCloud?.unmonitoredCloud?.map((sc) => sc.values?.ipAddress).join(", "));
    else setIps("");
  }, [selectedCloud]);

  useEffect(() => {
    if (!cloudModalOpen)
      setTimeout(() => {
        fetchQueries();
      }, 10000);
  }, [cloudModalOpen]);

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        ...TABLE_EXPANDABLE_DEFAULT_COLUMN,
      },
      {
        accessor: "cloud",
        header: "Cloud provider",
        cell: ({ row }) => {
          return (
            <span>
              <img src={`./assets/${row.original.icon}`} className="iconStyle" />
              <span>{row.original.cloud}</span>
            </span>
          );
        },
      },
      {
        accessor: "cloudStatus",
        header: "Cloud status",
        width: 100,
        cell: ({ row }) => {
          if (row.original.cloudStatus)
            return (
              <span>
                <SyncDoneIcon />
                <span>Connected</span>
              </span>
            );
          else
            return (
              <span>
                <SyncOffIcon />
                <span>Not setup</span>
              </span>
            );
        },
      },
      {
        accessor: "cloudHosts",
        header: "Cloud hosts",
        width: 100,
        cell: ({ value }) => {
          if (value != null && !isNaN(value)) return <span>{value}</span>;
          else return <span>-</span>;
        },
      },
      {
        accessor: "oneagentHosts",
        header: "OneAgent hosts",
        width: 100,
        cell: ({ value }) => {
          if (value != null && !isNaN(value)) return <span>{value}</span>;
          else {
            return <span>-</span>;
          }
        },
      },
      {
        header: "OneAgent coverage",
        width: 120,
        cell: ({ row }) => {
          const coverage = coverageRatio(row);
          if (coverage > 100) return <span style={warningText}>&gt; 100%</span>;
          if (!isNaN(coverage)) return <span>{coverage.toFixed(0)}%</span>;
          return <span>-</span>;
        },
      },
      {
        header: "Priority",
        width: 100,
        cell: ({ row }) => {
          const coverage = coverageRatio(row);
          if (!row.original.cloudStatus && row.original.oneagentHosts > 0)
            return <span style={criticalText}>Critical</span>;
          if (coverage > 100)
            return <span style={criticalText}>Critical</span>;
          if (coverage == 100) return <span>-</span>;
          if (coverage >= 90) return <span>Low</span>;
          if (coverage > 70) return <span>Medium</span>;
          if (coverage >= 0) return <span style={warningText}>High</span>;
          return <span>-</span>;
        },
      },
      {
        header: "Actions",
        width: 190,
        cell: ({ row }) => {
          if (!row.original.cloudStatus || coverageRatio(row) > 100)
            return (
              <Flex minWidth={190}>
                <Button
                  className="connectCloud"
                  fullWidth
                  variant="primary"
                  onClick={() => {
                    setSelectedCloud(row.original);
                    setCloudModalOpen(true);
                  }}
                >
                  <span>
                    <SyncIcon />
                    Connect cloud
                  </span>
                </Button>
              </Flex>
            );
          if (coverageRatio(row) < 100)
            return (
              <Flex minWidth={200}>
                <Button
                  className="installOneagent"
                  fullWidth
                  onClick={() => {
                    setSelectedCloud(row.original);
                    setOneagentModalOpen(true);
                  }}
                >
                  <span>
                    <img src="./assets/oneagent.svg" className="iconStyle" />
                    Install OneAgents
                  </span>
                </Button>
              </Flex>
            );
          return <Flex>-</Flex>;
        },
      },
      {
        header: " ",
        width: 50,
        cell: ({ row }) => {
          return (
            <Menu>
              <Menu.Trigger>
                <Button style={{ padding: 0, margin: 0 }} prefixIcon={<DotMenuIcon />} variant="minimal" />
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
                    <img src="./assets/oneagent.svg" className="iconStyle" />
                  </Menu.ItemIcon>
                  Install OneAgents
                </Menu.Item>
              </Menu.Content>
            </Menu>
          );
        },
      },
    ],
    []
  );

  const tableData = useMemo<Cloud[]>(() => {
    // console.log("useMemo:", data);
    return data;
  }, [data]);

  return (
    <div className="cloudTable">
      <DataTable
        columns={columns}
        data={tableData}
        variant={{ contained: true, rowSeparation: "horizontalDividers", verticalDividers: true }}
        resizable={true}
      >
        <DataTable.ExpandableRow>
          {({ row }) => {
            if (Array.isArray(row.unmonitoredCloud) && row.unmonitoredCloud.length > 0) {
              return (
                <HostsTable unmonitoredCloud={row.unmonitoredCloud} setIps={setIps} setOneagentModalOpen={setOneagentModalOpen}/>
              );
            } else
              return (
                <Flex flexDirection="column">
                  <p>No unmonitored hosts detected. Connect additional clouds.</p>
                </Flex>
              );
          }}
        </DataTable.ExpandableRow>
      </DataTable>
      <ConnectCloudModal
        modalOpen={cloudModalOpen && selectedCloud?.cloudType != "EC2" && selectedCloud?.cloudType != "AZURE"}
        setModalOpen={setCloudModalOpen}
        selectedCloud={selectedCloud}
        apiUrl={apiUrl}
        gen2Url={gen2Url}
        demoMode={demoMode}
        setMockCloudData={setMockCloudData}
      />
      <ConnectAWSModal
        modalOpen={cloudModalOpen && selectedCloud?.cloudType == "EC2"}
        setModalOpen={setCloudModalOpen}
        selectedCloud={selectedCloud}
        apiUrl={apiUrl}
        gen2Url={gen2Url}
        demoMode={demoMode}
        setMockCloudData={setMockCloudData}
        configToken={configToken}
        getConfigToken={getConfigToken}
      />
      <ConnectAzureModal
        modalOpen={cloudModalOpen && selectedCloud?.cloudType == "AZURE"}
        setModalOpen={setCloudModalOpen}
        selectedCloud={selectedCloud}
        apiUrl={apiUrl}
        gen2Url={gen2Url}
        demoMode={demoMode}
        setMockCloudData={setMockCloudData}
        configToken={configToken}
        getConfigToken={getConfigToken}
      />
      <InstallOneagentModal
        modalOpen={oneagentModalOpen}
        setModalOpen={setOneagentModalOpen}
        selectedCloud={selectedCloud}
        apiUrl={apiUrl}
        gen2Url={gen2Url}
        demoMode={demoMode}
        ips={ips}
      />
    </div>
  );
};
