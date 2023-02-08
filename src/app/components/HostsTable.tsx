import React, { useState, useEffect } from "react";
// import { FilterBar, FilterItemValues } from "@dynatrace/wave-components-preview/filters";
import { Flex, Link, TextInput, Text, Sheet, Button, Paragraph } from "@dynatrace/wave-components-preview";
import { DataTable, useFilteredData } from "@dynatrace/wave-components-preview/tables";
import { useMockHostData } from "../hooks/useMockHostData";
// import { AgentButtons } from "./AgentButtons";
// import { MockHostPage } from "./MockHostPage";
import { Host } from "../types/HostTypes";



export const MockHostsTable = (props) => {
    const {hostList:mockHostList, generateHostData} = useMockHostData();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState(hosts[0]);

  useEffect(() => {
    if (props.mode) hosts.forEach((host) => (host.mode = props.mode));
  }, [props.mode]);

//   useEffect(() => {
//     if (props.appsec) hosts.forEach((host) => (host.appsec = props.appsec));
//   }, [props.appsec]);

//   useEffect(() => {
//     if (props.extensions) hosts.forEach((host) => (host.extensions = props.extensions));
//   }, [props.extensions]);

  const columns = [
    {
      header: "Host",
      accessor: "host",
      cell: ({ value, row }) => {
        // return <Link href="">{value}</Link>;
        return (
          <Button variant="minimal" onClick={() => {
            setTarget(row.original);
            setSheetOpen(true);
          }}>{row.original.host}</Button>
          
        );
      },
    },
    {
      header: "Cloud",
      accessor: "cloud",
    },
    {
      header: "OS",
      accessor: "os",
    },
    // {
    //   header: "Services",
    //   accessor: "services",
    //   id: "office",
    // },
    // {
    //   header: "Publicly Accessible",
    //   accessor: "public",
    //   cell: ({ value, row }) => {
    //     return value ? <Text textStyle="default-emphasized">TRUE</Text> : <Text>FALSE</Text>;
    //   },
    // },
    {
      header: "OneAgent Mode",
      accessor: "mode",
    },
    // {
    //   header: "AppSec",
    //   accessor: "appsec",
    //   cell: ({ value, row }) => {
    //     return value ? <Text>TRUE</Text> : <Text textStyle="default-emphasized">FALSE</Text>;
    //   },
    // },
    // {
    //   header: "Recommended Extensions",
    //   accessor: "extensions",
    //   cell: ({ value, row }) => {
    //     return value ? <Text>TRUE</Text> : <Text textStyle="default-emphasized">FALSE</Text>;
    //   },
    // },
    {
      header: "Actions",
      autoWidth: true,
      cell: ({ value, row }) => {
        // return <AgentButtons recommendations={props.recommendations} target={row.original} setTable={setHosts} />;
        return <Button>Install</Button>
      },
    },
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   function filterFn(filters: FilterItemValues, entry: any): boolean {
  //     return Object.keys(filters).every((filterName) =>
  //       Object.values(entry)
  //         .join()
  //         .toLowerCase()
  //         .includes((filters[filterName].value as string).toLowerCase())
  //     );
  //   }
  //   const { onChange, filteredData } = useFilteredData(hosts, filterFn);
  return (
    <Flex gap={8} flexDirection="column">
      {/* <FilterBar onFilterChange={onChange}>
        <FilterBar.Item name="filterItem" label="Filter">
          <TextInput />
        </FilterBar.Item>
      </FilterBar> */}
      <DataTable columns={columns} data={hosts} height={400} />
      {/* <MockHostPage
            sheetOpen={sheetOpen}
            setSheetOpen={setSheetOpen}
            recommendations={props.recommendations}
            description={props.description}
            target={target}
            setHosts={setHosts}
          /> */}
    </Flex>
  );
};
