import React, { Dispatch, SetStateAction, useState, useEffect, useMemo } from "react";
import { Modal, Flex, FormField, TextInput, Button, Link } from "@dynatrace/strato-components-preview";
// import {
//   accessTokensApiTokensClient,
//   ApiTokenCreate,
//   ApiTokenCreateScopesItem,
// } from "@dynatrace-sdk/client-classic-environment-v2";
import { ExternalLinkIcon } from "@dynatrace/strato-icons";
import { Cloud } from "../types/CloudTypes";
// import { functions } from "@dynatrace/util-app";

const SAMPLE_AWS = {
  label: "string",
  partitionType: "AWS_CN",
  authenticationData: {
    type: "KEYS",
    keyBasedAuthentication: {
      accessKey: "string",
      secretKey: "string",
    },
    // "roleBasedAuthentication": {
    //   "iamRole": "string",
    //   "accountId": "string"
    // }
  },
  // "taggedOnly": true,
  // "tagsToMonitor": [
  //   {
  //     "name": "string",
  //     "value": "string"
  //   }
  // ],
  // "supportingServicesToMonitor": [
  //   {
  //     "name": "string",
  //     "monitoredMetrics": [
  //       {
  //         "name": "string",
  //         "statistic": "AVERAGE",
  //         "dimensions": [
  //           "string"
  //         ]
  //       }
  //     ]
  //   }
  // ]
};

export const ConnectCloudModal = ({
  modalOpen,
  setModalOpen,
  selectedCloud,
  apiUrl,
  gen2Url,
  demoMode,
  setMockCloudData,
}: {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedCloud?: Cloud;
  apiUrl: string;
  gen2Url: string;
  demoMode: boolean;
  setMockCloudData: React.Dispatch<React.SetStateAction<Cloud[]>>;
}) => {
  const [cloudUrl, setCloudUrl] = useState("");
  const [cloudKey, setCloudKey] = useState("");
  // const [token, setToken] = useState<string>("<TOKEN_HERE>");
  const url = gen2Url + (selectedCloud?.setupPath || "");
  const awsPayload = useMemo(() => {
    const payload = JSON.parse(JSON.stringify(SAMPLE_AWS));
    payload.authenticationData.keyBasedAuthentication.accessKey = cloudUrl;
    payload.authenticationData.keyBasedAuthentication.secretKey = cloudKey;
    return payload;
  }, [cloudUrl, cloudKey]);

  return (
    <Modal title={`Add ${selectedCloud?.cloud} integration`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
      <Flex flexDirection="column">
        <Flex flexDirection="row">
          {selectedCloud?.icon && <img src={`./assets/` + selectedCloud.icon} className="iconStyle" />}
          <span>&nbsp; Add {selectedCloud?.cloud} integration:</span>
        </Flex>
        {demoMode && (
          <div>
            <FormField label="(Mock)">
              <FormField label="API URL">
                <TextInput placeholder="https://xxx.xxxxxxxx.xxx/xxx" value={cloudUrl} onChange={setCloudUrl} />
              </FormField>
              <FormField label="API Key">
                <TextInput placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={cloudKey} onChange={setCloudKey} />
              </FormField>
            </FormField>
          </div>
        )}
        <Flex flexItem flexGrow={0}>
          {demoMode && (
            <Button
              variant="accent"
              onClick={() => {
                console.log("CloudConnectModal (demo):", { cloudUrl, cloudKey });

                //Update mock data
                setMockCloudData((oldData) => {
                  if (selectedCloud) selectedCloud.cloudStatus = true;
                  if (selectedCloud)
                    selectedCloud.cloudHosts = Math.round((1 + Math.random()) * selectedCloud.oneagentHosts);
                  return [...oldData];
                });

                setModalOpen(false);
              }}
            >
              Connect
            </Button>
          )}
          {!demoMode && (
            <Link target="_blank" href={url}>
              <Button
                variant="accent"
                onClick={() => {
                  console.log("opening settings:", url);
                }}
              >
                {selectedCloud?.cloudType == "VMWare" ? "Settings" : "Hub"} <ExternalLinkIcon />
              </Button>
            </Link>
          )}
          <Button
            variant="emphasized"
            onClick={() => {
              setModalOpen(false);
            }}
          >
            Done
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};
