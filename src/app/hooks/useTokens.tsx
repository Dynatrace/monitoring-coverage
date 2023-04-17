import React, { useState } from "react";
import { showToast } from "@dynatrace/strato-components-preview";
import {
  accessTokensApiTokensClient,
  ApiTokenCreate,
  ApiTokenCreateScopesItem,
} from "@dynatrace-sdk/client-classic-environment-v2";

export const useTokens = () => {
  const [configToken, setConfigToken] = useState<string | undefined>();

  const getConfigToken: () => Promise<string> = async () => {
    const config: {
      body: ApiTokenCreate;
      abortSignal?: AbortSignal | undefined;
    } = {
      body: {
        scopes: [ApiTokenCreateScopesItem.WriteConfig],
        name: "Settings writer from Monitoring Coverage for Cloud APIs",
        expirationDate: "now+1h",
      },
    };
    try {
      const value = await accessTokensApiTokensClient.createApiToken(config);
      setConfigToken(value.token || "TOKEN_MISSING");
      return value.token || "TOKEN_MISSING";
    } catch (reason) {
      showToast({
        title: "Creating API token failed",
        type: "critical",
        message: reason.message,
      });
      setConfigToken("TOKEN_MISSING");
      return "TOKEN_MISSING";
    }
  };

  return { configToken, getConfigToken };
};
