import React, { useMemo, Dispatch } from "react";
import { getIntentLink } from "@dynatrace-sdk/navigation";
import { DataTable, convertToColumns, Link, QueryColumn, Menu, Button, convertToColumnsFromWellFormedArray } from "@dynatrace/strato-components-preview";
import { OpenWithIcon, DotMenuIcon } from "@dynatrace/strato-icons";
import { UnmonitoredCloud, UnmonitoredCloudCols } from "../types/CloudTypes";

export const HostsTable = ({
  unmonitoredCloud,
  setOneagentModalOpen,
  setIps,
}: {
  unmonitoredCloud: UnmonitoredCloud[];
  setOneagentModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setIps: Dispatch<React.SetStateAction<string>>;
}) => {
  const columns = useMemo(() => {
    // const cols = convertToColumns(unmonitoredCloud);
    const cols = [...UnmonitoredCloudCols];
    const entCol = cols.find((c) => (c.id = "id"));
    // debugger;
    if (entCol) {
      entCol.cell = ({ row }) => {
        const intentLink = getIntentLink({ "dt.entity.host": row.original.id });
        return (
          <Link href={intentLink} target="_blank">
            {row.original.id} <OpenWithIcon />
          </Link>
        );
      };
      // entCol.ratioWidth = 1.5;
      // entCol.width = 500;
    }
    cols
      .filter((c) => c != entCol)
      .forEach((c) => {
        // c.ratioWidth = 1;
        // c.width = 220;
      });
    cols.push({
      header: " ",
      // width: 50,
      autoWidth: true,

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
                  setIps(row.original.ipAddress);
                  setOneagentModalOpen(true);
                }}
              >
                <Menu.ItemIcon>
                  <img src="./assets/oneagent.svg" className="iconStyle" />
                </Menu.ItemIcon>
                Install OneAgent
              </Menu.Item>
            </Menu.Content>
          </Menu>
        );
      },
    } as QueryColumn);

    return cols;
  }, [unmonitoredCloud]);
  return (
    <div className="hostTable">
      <DataTable data={unmonitoredCloud} columns={columns} resizable>
        <DataTable.Pagination />
      </DataTable>
    </div>
  );
};
