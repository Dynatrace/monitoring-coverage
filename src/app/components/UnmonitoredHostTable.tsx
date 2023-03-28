import React, { useState, useMemo } from "react";
import { DataTable, Modal, Flex, Button, TableColumn } from '@dynatrace/strato-components-preview';

export const UnmonitoredHostTable = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const columns = useMemo<TableColumn[]>(
    () => [
      { accessor: "cloud" },
      { accessor: "coverage" },
      { accessor: "unmonitored" },
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
                Install
              </Button>
            </Flex>
          );
        },
      },
    ],
    []
  );
  const data = [
    { cloud: "AWS", coverage: "??", unmonitored: "??" },
    { cloud: "Azure", coverage: "??", unmonitored: "??" },
    { cloud: "GCP", coverage: "??", unmonitored: "??" },
    { cloud: "VMWare", coverage: "??", unmonitored: "??" },
  ];

  return (
    <div>
      <DataTable columns={columns} data={data} />
      <Modal title={`Add integration`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
        <Flex flexDirection="column">
          <span>Get info from user here:</span>
          <Flex flexItem flexGrow={0}>
            <Button
              variant="accent"
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
