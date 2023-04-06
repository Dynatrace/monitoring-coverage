import React, { useState, useMemo, useEffect } from "react";
import {
  DataTable,
  Flex,
  Button,
  TableColumn,
  Menu,
  Text,
  TABLE_EXPANDABLE_DEFAULT_COLUMN,
  useCurrentTheme,
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
const successText = {
  color: Colors.Text.Success.Default,
};

const coverageRatio = (row) =>
  row.original.cloudStatus ? ((row.original.oneagentHosts || 0) / row.original.cloudHosts) * 100 : NaN;

export const CloudTable = ({
  data,
  gen2Url,
  fetchQueries,
  demoMode,
  setMockCloudData,
  configToken,
  getConfigToken,
}: {
  data: Cloud[];
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
  const theme = useCurrentTheme();
  useEffect(() => {
    if (selectedCloud) setIps(selectedCloud?.unmonitoredCloud?.map((sc) => sc.ipAddress).join(", "));
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
        width: 170,
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
              <Text className="iconStyle">
                <SyncDoneIcon />
                Connected
              </Text>
            );
          else if (row.original.oneagentHosts > 0)
            return (
              <Text style={criticalText} className="iconStyle">
                <SyncOffIcon />
                Not setup
              </Text>
            );
          else
            return (
              <Text className="iconStyle">
                <SyncOffIcon />
                Not setup
              </Text>
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
          if (coverage > 100) return <span style={criticalText}>&gt; 100%</span>;
          if (coverage == 100) return <span style={successText}>100%</span>;
          if (!isNaN(coverage) && coverage < 90) return <span style={warningText}>{coverage.toFixed(0)}%</span>;
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
          if (coverage > 100) return <span style={criticalText}>Critical</span>;
          if (coverage == 100) return <span>-</span>;
          if (coverage >= 90) return <span>Low</span>;
          if (coverage > 70) return <span>Medium</span>;
          if (coverage >= 0) return <span style={warningText}>High</span>;
          return <span>-</span>;
        },
      },
      {
        header: "Actions",
        width: 170,
        cell: ({ row }) => {
          if (!row.original.cloudStatus || coverageRatio(row) > 100)
            return (
              <Flex minWidth={200}>
                <Button
                  className="connectCloud actionButton"
                  width="full"
                  variant="accent"
                  onClick={() => {
                    setSelectedCloud(row.original);
                    setCloudModalOpen(true);
                  }}
                >
                  <Button.Prefix>
                    <SyncIcon />
                  </Button.Prefix>
                  Connect cloud
                </Button>
              </Flex>
            );
          if (coverageRatio(row) < 100)
            return (
              <Flex minWidth={200}>
                <Button
                  className="installOneagent actionButton"
                  width="full"
                  variant="emphasized"
                  onClick={() => {
                    setSelectedCloud(row.original);
                    setOneagentModalOpen(true);
                  }}
                >
                  <Button.Prefix>
                    <img
                      src={theme === "light" ? "./assets/oneagent.svg" : "./assets/oneagent-white.svg"}
                      className="iconStyle"
                    />
                  </Button.Prefix>
                  Install OneAgents
                </Button>
              </Flex>
            );
          return <Flex>-</Flex>;
        },
      },
      {
        header: " ",
        width: 40,
        cell: ({ row }) => {
          return (
            <Menu>
              <Menu.Trigger>
                <Button style={{ padding: 0, margin: 0 }} variant="default">
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
                <HostsTable
                  unmonitoredCloud={row.unmonitoredCloud}
                  setIps={setIps}
                  setOneagentModalOpen={setOneagentModalOpen}
                />
              );
            } else
              return (
                <Flex flexDirection="column">
                  <Text>No unmonitored hosts detected. Connect additional clouds.</Text>
                </Flex>
              );
          }}
        </DataTable.ExpandableRow>
      </DataTable>
      {cloudModalOpen && (
        <div>
          <ConnectCloudModal
            modalOpen={cloudModalOpen && selectedCloud?.cloudType != "EC2" && selectedCloud?.cloudType != "AZURE"}
            setModalOpen={setCloudModalOpen}
            selectedCloud={selectedCloud}
            gen2Url={gen2Url}
            demoMode={demoMode}
            setMockCloudData={setMockCloudData}
          />
          <ConnectAWSModal
            modalOpen={cloudModalOpen && selectedCloud?.cloudType == "EC2"}
            setModalOpen={setCloudModalOpen}
            selectedCloud={selectedCloud}
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
            gen2Url={gen2Url}
            demoMode={demoMode}
            setMockCloudData={setMockCloudData}
            configToken={configToken}
            getConfigToken={getConfigToken}
          />
        </div>
      )}
      {oneagentModalOpen && (
        <InstallOneagentModal
          modalOpen={oneagentModalOpen}
          setModalOpen={setOneagentModalOpen}
          selectedCloud={selectedCloud}
          gen2Url={gen2Url}
          demoMode={demoMode}
          ips={ips}
          setMockCloudData={setMockCloudData}
        />
      )}
    </div>
  );
};
