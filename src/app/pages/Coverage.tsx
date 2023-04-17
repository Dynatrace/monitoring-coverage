import React, { useEffect } from "react";
import { Flex, LoadingIndicator } from "@dynatrace/strato-components-preview";
import { CloudTable } from "../components/CloudTable";
import { useMockCloudData } from "../hooks/useMockCloudData";
import { useRealCloudData } from "../hooks/useRealCloudData";
import { useTokens } from "../hooks/useTokens";
import "./Coverage.css";

export const Coverage = ({ gen2Url, demoMode, setDemoMode }) => {
  const isLoading = false;
  const { mockCloudData, setMockCloudData } = useMockCloudData();
  const { realCloudData, fetchQueries } = useRealCloudData();
  const { configToken, getConfigToken } = useTokens();

  useEffect(() => {
    fetchQueries();
  }, []);

  return (
    <Flex flexDirection="column">
      <LoadingIndicator loading={isLoading} />
      <CloudTable
        data={realCloudData}
        gen2Url={gen2Url}
        fetchQueries={fetchQueries}
        demoMode={demoMode}
        setMockCloudData={setMockCloudData}
        configToken={configToken}
        getConfigToken={getConfigToken}
      />
    </Flex>
  );
};
