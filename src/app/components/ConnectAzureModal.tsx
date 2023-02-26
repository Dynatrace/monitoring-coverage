import React, { Dispatch, SetStateAction, useState, useEffect, useMemo } from "react";
import { Modal, Flex, FormField, TextInput, Button, Link, PasswordInput } from "@dynatrace/wave-components-preview";
import {
  accessTokensApiTokensClient,
  ApiTokenCreate,
  ApiTokenCreateScopesItem,
} from "@dynatrace-sdk/client-classic-environment-v2";
import { ExternalLinkIcon } from "@dynatrace/react-icons";
import { Cloud } from "../types/CloudTypes";
import { functions } from "@dynatrace/util-app";

const SAMPLE_AZURE = {
  label: "SL4YrPIQ5byopWRpxpjem+-+zrZHi R7Tuq",
  appId: "string",
  directoryId: "string",
  key: "string",
  active: true,
  autoTagging: true,
  // "monitorOnlyTaggedEntities": true,
  // "monitorOnlyTagPairs": [
  //   {
  //     "name": "string",
  //     "value": "string"
  //   }
  // ],
  // "monitorOnlyExcludingTagPairs": [
  //   {
  //     "name": "string",
  //     "value": "string"
  //   }
  // ],
  // "supportingServices": [
  //   {
  //     "name": "string",
  //     "monitoredMetrics": [
  //       {
  //         "name": "string",
  //         "dimensions": [
  //           "string"
  //         ]
  //       }
  //     ]
  //   }
  // ]
};

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
          setModalOpen(false);
        } else if (result.error) {
          console.warn("gen-2-proxy failure:", result.error);
        }
      });
  };

  const mockConnect = () => {
    console.log("CloudConnectModal (mock):", { name, clientId, tenantId, secretKey });
    //Update mock data
    setMockCloudData((oldData) => {
      if (selectedCloud) selectedCloud.cloudStatus = true;
      if (selectedCloud) selectedCloud.cloudHosts = Math.round((1 + Math.random()) * selectedCloud.oneagentHosts);
      return [...oldData];
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
          <Button variant="primary" onClick={demoMode ? mockConnect : realConnect}>
            Connect
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
