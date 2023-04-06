import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Modal,
  Flex,
  FormField,
  TextInput,
  Button,
  Select,
  SelectOption,
  SelectedKeys,
  PasswordInput,
  Text,
  showToast,
} from '@dynatrace/strato-components-preview';
import { Cloud } from "../types/CloudTypes";
import { functions } from "@dynatrace/util-app";
import {generateHostData} from "../hooks/useMockCloudData";

export const ConnectAWSModal = ({
  modalOpen,
  setModalOpen,
  selectedCloud,
  gen2Url,
  demoMode,
  setMockCloudData,
  configToken,
  getConfigToken,
}: {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedCloud?: Cloud;
  gen2Url: string;
  demoMode: boolean;
  setMockCloudData: React.Dispatch<React.SetStateAction<Cloud[]>>;
  configToken: string | undefined;
  getConfigToken: () => Promise<string>;
}) => {
  const [name, setName] = useState("");
  const [auth, setAuth] = useState<SelectedKeys | null>(["key"]);
  const [role, setRole] = useState("");
  const [accountId, setAccountId] = useState("");
  const [externalId, setExternalId] = useState("");
  const [partition, setPartition] = useState<SelectedKeys | null>(["AWS_DEFAULT"]);
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretKeyId, setSecretKeyId] = useState("");

  const realConnect = async () => {
    console.log("CloudConnectModal (real):", { name, auth, role, accountId, externalId, accessKeyId, secretKeyId });
    const url = `${gen2Url}/api/config/v1/aws/credentials`;
    const token = configToken != undefined ? configToken : await getConfigToken();
    const awsPayload = {
      label: name,
      partitionType: auth?.includes("key") && partition?.length ? partition[0] : undefined,
      authenticationData: {
        type: auth?.includes("key") ? "KEYS" : "ROLE",
        keyBasedAuthentication: auth?.includes("key")
          ? {
              accessKey: accessKeyId,
              secretKey: secretKeyId,
            }
          : undefined,
        roleBasedAuthentication: auth?.includes("role")
          ? {
              iamRole: role,
              accountId: accountId,
            }
          : undefined,
      },
    };
    const requestInit = {
      method: "POST",
      headers: {
        Authorization: "Api-Token " + token,
        "Content-Type": "application/json; charset=utf-8",
        accept: "application/json; charset=utf-8",
      },
      body: JSON.stringify(awsPayload),
    } as RequestInit;

    functions
      .call("gen-2-proxy", { url, requestInit })
      .then((response) => response.json())
      .then((result) => {
        console.log("gen-2-proxy success:", result);
        if (result.data) {
          showToast({
            title: 'Cloud connection created',
            type: 'info',
            message: `Successfully created connection to ${selectedCloud?.cloud}. ${JSON.stringify(result.data)}`,
            lifespan: 4000,
          })
          setModalOpen(false);
        } else if (result.error) {
          console.warn("gen-2-proxy failure:", result.error);
          showToast({
            title: 'Cloud connection could not be created',
            type: 'critical',
            message: `Failed to create connection to ${selectedCloud?.cloud}. ${result.data}`,
          })
        }
      });
  };

  const mockConnect = () => {
    console.log("CloudConnectModal (mock):", { name, auth, role, accountId, externalId, accessKeyId, secretKeyId });
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
      title: '(mock) Cloud connection created',
      type: 'info',
      message: `Successfully created connection to ${selectedCloud?.cloud}`,
      lifespan: 4000,
    })
    setModalOpen(false);
  };

  return (
    <Modal title={`Add ${selectedCloud?.cloud} integration`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
      <Flex flexDirection="column" gap={16}>
        <Flex flexDirection="row">
          <Text>{selectedCloud?.icon && <img src={`./assets/` + selectedCloud.icon} className="iconStyle" />}
          &nbsp; Add {selectedCloud?.cloud} integration:</Text>
        </Flex>
        <FormField label="Connection name">
          <TextInput placeholder="For example, Dynatrace integration" value={name} onChange={setName} />
        </FormField>
        <FormField label="Authention method">
          <Select selectedId={auth} onChange={setAuth}>
            <SelectOption id="key">Key-based authentication</SelectOption>
            <SelectOption id="role">Role-based authentication</SelectOption>
          </Select>
        </FormField>
        {auth?.includes("key") && (
          <Flex flexDirection="column" gap={16}>
            <Select selectedId={partition} onChange={setPartition}>
              <SelectOption id="AWS_DEFAULT">Default</SelectOption>
              <SelectOption id="AWS_US_GOV">US Gov</SelectOption>
              <SelectOption id="AWS_CN">China</SelectOption>
            </Select>
            <FormField label="Access Key ID">
              <TextInput placeholder="Access key" value={accessKeyId} onChange={setAccessKeyId} />
            </FormField>
            <FormField label="Secret access key">
              <PasswordInput placeholder="Secret key" value={secretKeyId} onChange={setSecretKeyId} />
            </FormField>
          </Flex>
        )}
        {auth?.includes("role") && (
          <Flex flexDirection="column" gap={16}>
            <FormField label="IAM role that Dynatrace should use to get monitoring data">
              <TextInput placeholder="Role for this connection" value={role} onChange={setRole} />
            </FormField>
            <FormField label="Your Amazon account ID">
              <TextInput placeholder="Account ID" value={accountId} onChange={setAccountId} />
            </FormField>
            <FormField label="Token (use this value as the External ID for your IAM role)">
              <PasswordInput placeholder="********************" value={externalId} onChange={setExternalId} />
            </FormField>
          </Flex>
        )}
        <Flex flexGrow={0} justifyContent="flex-end">
          <Button variant="emphasized" onClick={demoMode ? mockConnect : realConnect}>
            Connect
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
