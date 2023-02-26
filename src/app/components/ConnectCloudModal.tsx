import React, { Dispatch, SetStateAction, useState, useEffect, useMemo } from "react";
import { Modal, Flex, FormField, TextInput, Button, Link } from "@dynatrace/wave-components-preview";
// import {
//   accessTokensApiTokensClient,
//   ApiTokenCreate,
//   ApiTokenCreateScopesItem,
// } from "@dynatrace-sdk/client-classic-environment-v2";
import { ExternalLinkIcon } from "@dynatrace/react-icons";
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

  // useEffect(() => {
  //   const config: {
  //     body: ApiTokenCreate;
  //     abortSignal?: AbortSignal | undefined;
  //   } = {
  //     body: {
  //       scopes: [ApiTokenCreateScopesItem.WriteConfig],
  //       name: "Settings writer from Monitoring Coverage for Cloud APIs",
  //       expirationDate: "now+1h",
  //     },
  //   };
  //   accessTokensApiTokensClient.createApiToken(config).then(
  //     (value) => {
  //       console.log("accessTokensApiTokensClient.createApiToken:", value);
  //       setToken(value.token || "TOKEN_MISSING");
  //     },
  //     (reason) => {
  //       console.warn("accessTokensApiTokensClient.createApiToken failed:", reason.message, reason.response.url);
  //       setToken("TOKEN_MISSING");
  //     }
  //   );
  // }, []);

  return (
    <Modal title={`Add ${selectedCloud?.cloud} integration`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
      <Flex flexDirection="column">
        <Flex flexDirection="row">
          {selectedCloud?.icon && <img src={`./assets/` + selectedCloud.icon} className="iconStyle" />}
          <span>&nbsp; Add {selectedCloud?.cloud} integration:</span>
        </Flex>
        {demoMode && (
          <div>
            <FormField label="API URL">
              <TextInput placeholder="https://xxx.xxxxxxxx.xxx/xxx" value={cloudUrl} onChange={setCloudUrl} />
            </FormField>
            <FormField label="API Key">
              <TextInput placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={cloudKey} onChange={setCloudKey} />
            </FormField>
          </div>
        )}
        <Flex flexItem flexGrow={0}>
          {demoMode && (
            //TODO: refactor into seperate component to avoid many unnecessary props
            <Button
              variant="primary"
              onClick={() => {
                console.log("CloudConnectModal (demo):", { cloudUrl, cloudKey });
                //Test sending to Gen2 API
                // const url = `${gen2Url}/api/config/v1/aws/credentials`;
                // const requestInit = {
                //   method: "POST",
                //   headers: {
                //     Authorization: "Api-Token " + token,
                //     "Content-Type": "application/json; charset=utf-8",
                //     accept: "application/json; charset=utf-8",
                //   },
                //   body: JSON.stringify(awsPayload),
                // } as RequestInit;

                // functions
                //   .call("gen-2-proxy", { url, requestInit })
                //   .then((response) => response.text())
                //   .then(
                //     (result) => console.log("gen-2-proxy success:", result),
                //     (reason) => console.warn("gen-2-proxy failed:", reason)
                //   );

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
                variant="primary"
                onClick={() => {
                  console.log("opening settings:", url);
                }}
              >
                Settings <ExternalLinkIcon />
              </Button>
            </Link>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              // activateCloud(selectedCloud);
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
