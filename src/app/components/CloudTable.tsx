import React, { useState, useMemo } from "react";
import { DataTable, Modal, Flex, Button, TableColumn } from "@dynatrace/wave-components-preview";

export const CloudTable = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const columns = useMemo<TableColumn[]>(
    () => [
      { accessor: "cloud" },
      { accessor: "status" },
      { accessor: "hosts" },
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
  const data = [
    { cloud: "AWS", status: "??", hosts: "??" },
    { cloud: "Azure", status: "??", hosts: "??" },
    { cloud: "GCP", status: "??", hosts: "??" },
    { cloud: "VMWare", status: "??", hosts: "??" },
  ];

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
