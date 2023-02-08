import React, { useEffect, useState } from "react";
import { Flex, Heading, Switch } from "@dynatrace/wave-components-preview";
import { CloudTable } from "../components/CloudTable";
import { UnmonitoredHostTable } from "../components/UnmonitoredHostTable";
import { useDQLQuery } from "../hooks/useDQLQuery";
import { useMockCloudData } from "../hooks/useMockCloudData";
import { useRealCloudData } from "../hooks/useRealCloudData";
import { Cloud } from "../types/CloudTypes";
import "./Coverage.css";

export const Coverage = () => {
  const [demoMode, setDemoMode] = useState(true);
  const { data: mockCloudData } = useMockCloudData();
  const { clouds: realCloudData, fetchQueries } = useRealCloudData();
  
  useEffect(()=>{
    console.log("demoMode:",demoMode);
    if(!demoMode) fetchQueries();
  },[demoMode])

  return (
    <Flex flexDirection="column">
      <Flex flexDirection="row" justifyContent="space-between">
        <Heading level={5}>Monitoring Coverage</Heading>
        <span className="tinyText">{demoMode ? "(showing mock data)" : ""}</span>
        <Switch value={demoMode} onChange={setDemoMode}>
          Demo mode
        </Switch>
      </Flex>

      <Flex flexDirection="column">
        <CloudTable data={demoMode ? mockCloudData : realCloudData} />
      </Flex>
    </Flex>
  );
};
