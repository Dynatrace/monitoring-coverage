import React, { useState, useMemo } from "react";
import {
  DataTable,
  Modal,
  Flex,
  Button,
  TableColumn,
  TABLE_EXPANDABLE_DEFAULT_COLUMN,
} from "@dynatrace/wave-components-preview";
import { SyncOffIcon, SyncDoneIcon, SyncIcon } from "@dynatrace/react-icons";
import { Colors } from "@dynatrace/design-tokens";
import { ConnectCloudModal } from "./ConnectCloudModal";
import { InstallOneagentModal } from "./InstallOneagentModal";
import { Cloud } from "../types/CloudTypes";
import "./CloudTable.css";

const iconStyle = {
  height: 20,
  width: 20,
  paddingRight: 5,
  verticalAlign: "middle",
};

const criticalText = {
  color: Colors.Text.Critical.Default,
};

const warningText = {
  color: Colors.Text.Warning.Default,
};

const coverageRatio = (row) =>
  row.original.cloudStatus ? (row.original.oneagentHosts / row.original.cloudHosts) * 100 : NaN;

export const CloudTable = ({ data }: { data: Cloud[] }) => {
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [oneagentModalOpen, setOneagentModalOpen] = useState(false);
  const [selectedCloud, setSelectedCloud] = useState();
  const columns = useMemo<TableColumn[]>(
    () => [
      {
        accessor: "cloud",
        header: "Cloud provider",
        cell: ({ row }) => {
          return (
            <span>
              <img src={`./assets/${row.original.icon}`} style={iconStyle} />
              <span>{row.original.cloud}</span>
            </span>
          );
        },
      },
      {
        accessor: "cloudStatus",
        header: "Cloud status",
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
        cell: ({ value }) => {
          if (value != null && !isNaN(value)) return <span>{value}</span>;
          else return <span>-</span>;
        },
      },
      {
        accessor: "oneagentHosts",
        header: "OneAgent hosts",
        cell: ({ value }) => {
          if (value != null && !isNaN(value)) return <span>{value}</span>;
          else return <span>-</span>;
        },
      },
      {
        header: "OneAgent coverage",
        cell: ({ row }) => {
          const coverage = coverageRatio(row);
          if (!isNaN(coverage)) return <span>{coverage.toFixed(0)}%</span>;
          else return <span>-</span>;
        },
      },
      {
        header: "Priority",
        cell: ({ row }) => {
          const coverage = coverageRatio(row);
          if (!row.original.cloudStatus && row.original.oneagentHosts > 0)
            return <span style={criticalText}>Critical</span>;
          if (coverage == 100) return <span>-</span>;
          if (coverage >= 90) return <span>Low</span>;
          if (coverage > 70) return <span>Medium</span>;
          if (coverage > 0) return <span style={warningText}>High</span>;
          return <span>-</span>;
        },
      },
      {
        header: "Actions",
        width: 200,
        cell: ({ row }) => {
          if (!row.original.cloudStatus)
            return (
              <Flex minWidth={200}>
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
          if (row.original.cloudHosts > row.original.oneagentHosts)
            return (
              <Flex minWidth={200}>
                <Button
                  className="installOneagent"
                  fullWidth
                  onClick={() => {
                    setOneagentModalOpen(true);
                  }}
                >
                  <span>
                    <img src="./assets/oneagent.svg" style={iconStyle} />
                    Install OneAgent
                  </span>
                </Button>
              </Flex>
            );
          return <Flex>-</Flex>;
        },
      },
    ],
    []
  );

  return (
    <div>
      <DataTable columns={columns} data={data} variant="default">
        <DataTable.ExpandableRow>
          {({ row }) => {
            return (
              <Flex flexDirection="column">
                <p>{JSON.stringify(row)}</p>
              </Flex>
            );
          }}
        </DataTable.ExpandableRow>
      </DataTable>
      <ConnectCloudModal modalOpen={cloudModalOpen} setModalOpen={setCloudModalOpen} selectedCloud={selectedCloud} />
      <InstallOneagentModal modalOpen={oneagentModalOpen} setModalOpen={setOneagentModalOpen} />
    </div>
  );
};
