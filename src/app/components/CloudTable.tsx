import React, { useState, useMemo } from "react";
import { DataTable, Modal, Flex, Button, TableColumn } from "@dynatrace/wave-components-preview";

export const CloudTable = ({oneAgentHostsQuery, cloudHostsQuery, awsHostsQuery, azureHostsQuery, gcpHostsQuery, vmwareHostsQuery}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const columns = useMemo<TableColumn[]>(
    () => [
      { accessor: "cloud" },
      { accessor: "oneAgentHosts" },
      { accessor: "cloudHosts" },
      {
        header: "Actions",
        cell: () => {
          return (
            <Flex>
              <Button
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                Setup
              </Button>
            </Flex>
          );
        },
      },
    ],
    []
  );
  const lookup = (query,name) => {
    //if(!query.result) 
    return "??"
    //query.result.
  }
  const data = useMemo(()=>{
    return [
      { cloud: "AWS", cloudHosts: "??", hosts: awsHostsQuery.result || "??" },
      { cloud: "Azure", cloudHosts: "??", hosts: azureHostsQuery.result || "??" },
      { cloud: "GCP", cloudHosts: "??", hosts: gcpHostsQuery.result || "??" },
      { cloud: "VMWare", cloudHosts: "??", hosts: vmwareHostsQuery.result || "??" },
    ];
  },[])
  

  return (
    <div>
      <DataTable columns={columns} data={data} />
      <Modal title={`Add integration`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
        <Flex flexDirection="column">
          <span>Get info from user here:</span>
          <Flex flexItem flexGrow={0}>
            <Button
              variant="primary"
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Connect
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </div>
  );
};
