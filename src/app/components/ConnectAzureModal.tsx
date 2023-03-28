import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Modal,
  Flex,
  FormField,
  TextInput,
  Button,
  PasswordInput,
  useToastNotification,
} from "@dynatrace/strato-components-preview";
import { Cloud, UnmonitoredCloud } from "../types/CloudTypes";
import { functions } from "@dynatrace/util-app";
import { generateHostData } from "../hooks/useMockCloudData";

export const ConnectAzureModal = ({
  modalOpen,
  setModalOpen,
  selectedCloud,
  apiUrl,
  gen2Url,
  demoMode,
  setMockCloudData,
  configToken,
  getConfigToken,
}: {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedCloud?: Cloud;
  apiUrl: string;
  gen2Url: string;
  demoMode: boolean;
  setMockCloudData: React.Dispatch<React.SetStateAction<Cloud[]>>;
  configToken: string | undefined;
  getConfigToken: () => Promise<string>;
}) => {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const { showToast } = useToastNotification();

  const realConnect = async () => {
    console.log("CloudConnectModal (real):", { name, clientId, tenantId, secretKey });
    const url = `${gen2Url}/api/config/v1/azure/credentials`;
    const token = configToken != undefined ? configToken : await getConfigToken();
    const azurePayload = {
      label: name,
      appId: clientId,
      directoryId: tenantId,
      key: secretKey,
      active: true,
      autoTagging: true,
    };
    const requestInit = {
      method: "POST",
      headers: {
        Authorization: "Api-Token " + token,
        "Content-Type": "application/json; charset=utf-8",
        accept: "application/json; charset=utf-8",
      },
      body: JSON.stringify(azurePayload),
    } as RequestInit;

    functions
      .call("gen-2-proxy", { url, requestInit })
      .then((response) => response.json())
      .then((result) => {
        console.log("gen-2-proxy success:", result);
        if (result.data) {
          showToast({
            title: "Cloud connection created",
            type: "info",
            message: `Successfully created connection to ${selectedCloud?.cloud}. ${JSON.stringify(result.data)}`,
            lifespan: 4000,
          });
          setModalOpen(false);
        } else if (result.error) {
          console.warn("gen-2-proxy failure:", result.error);
          showToast({
            title: "Cloud connection could not be created",
            type: "critical",
            message: `Failed to create connection to ${selectedCloud?.cloud}. ${result.data}`,
          });
        }
      });
  };

  const mockConnect = () => {
    console.log("CloudConnectModal (mock):", { name, clientId, tenantId, secretKey });
    //Update mock data
    setMockCloudData((oldData) => {
      if (selectedCloud) {
        selectedCloud.cloudStatus = true;
        selectedCloud.cloudHosts = Math.round((1 + Math.random()) * selectedCloud.oneagentHosts);
        selectedCloud.unmonitoredCloud = generateHostData(
          selectedCloud.cloudHosts - selectedCloud.oneagentHosts,
          "NEWCLOUDHOST",
          "newcloud"
        );
      }
      return [...oldData];
    });

    showToast({
      title: "(mock) Cloud connection created",
      type: "info",
      message: `Successfully created connection to ${selectedCloud?.cloud}`,
      lifespan: 4000,
    });
    setModalOpen(false);
  };

  return (
    <Modal title={`Add ${selectedCloud?.cloud} integration`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
      <Flex flexDirection="column">
        <Flex flexDirection="row">
          {selectedCloud?.icon && <img src={`./assets/` + selectedCloud.icon} className="iconStyle" />}
          <span>&nbsp; Add {selectedCloud?.cloud} integration:</span>
        </Flex>
        <FormField label="Connection name">
          <TextInput placeholder="For example, Dynatrace integration" value={name} onChange={setName} />
        </FormField>
        <FormField label="Client ID">
          <TextInput
            placeholder="For example, 98989ae2-4566-4efd-9db8-e194bb3910e4"
            value={clientId}
            onChange={setClientId}
          />
        </FormField>
        <FormField label="Tenant ID">
          <TextInput
            placeholder="For example, 68345fd1-3216-4aed-7be2-a244bb3907b2"
            value={tenantId}
            onChange={setTenantId}
          />
        </FormField>
        <FormField label="Secret Key">
          <PasswordInput placeholder="**********************" value={secretKey} onChange={setSecretKey} />
        </FormField>

        <Flex flexItem flexGrow={0}>
          <Button variant="accent" onClick={demoMode ? mockConnect : realConnect}>
            Connect
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
