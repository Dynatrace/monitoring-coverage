import React, { useEffect, useState } from "react";
import { Flex, Heading, LoadingIndicator, Switch,  } from '@dynatrace/strato-components-preview';
import { CloudTable } from "../components/CloudTable";
import { useMockCloudData } from "../hooks/useMockCloudData";
import { useRealCloudData } from "../hooks/useRealCloudData";
import { useTokens } from "../hooks/useTokens";
import "./Coverage.css";

export const Coverage = ({ apiUrl, gen2Url }) => {
  const [demoMode, setDemoMode] = useState(true);
  const { mockCloudData, setMockCloudData } = useMockCloudData();
  const { realCloudData, fetchQueries, runningDQL } = useRealCloudData();
  const {configToken, getConfigToken} = useTokens();

  useEffect(() => {
    if (!demoMode) fetchQueries();
  }, [demoMode]);

  return (
    <Flex flexDirection="column">
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-end">
        <Heading level={1}>Monitoring Coverage</Heading>
        <span className="tinyText">{demoMode ? "(showing mock data)" : ""}</span>
        <Flex flexDirection="row">
          <LoadingIndicator loading={runningDQL}/>
        <Switch value={demoMode} onChange={setDemoMode}>
          Demo mode
        </Switch>
        </Flex>
      </Flex>

      <Flex flexDirection="column">
        <CloudTable
          data={demoMode ? mockCloudData : realCloudData}
          apiUrl={apiUrl}
          gen2Url={gen2Url}
          fetchQueries={fetchQueries}
          demoMode={demoMode}
          setMockCloudData={setMockCloudData}
          runningDQL={runningDQL}
          configToken={configToken}
          getConfigToken={getConfigToken}
        />
      </Flex>
    </Flex>
  );
};
