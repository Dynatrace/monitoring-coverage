import {
  ToastContainer,
  _NewPage as Page,
  AppHeader,
  Flex,
  Heading,
  Text,
  List,
  Switch,
  useCurrentTheme,
} from "@dynatrace/strato-components-preview";
import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { coreClient } from "@dynatrace-sdk/client-core";
import { getEnvironmentUrl } from "@dynatrace-sdk/app-environment";
import { Header } from "./components/Header";
import { Coverage } from "./pages/Coverage";
import { DetailViewCard } from "./components/DetailViewCard";
import { MainViewCard } from "./components/MainViewCard";
import { FavouriteIcon, UnfavouriteIcon } from "@dynatrace/strato-icons";

export const App = () => {
  const [gen2Url, setGen2Url] = useState<string>(getEnvironmentUrl().replace(/\.apps/, ""));
  const [demoMode, setDemoMode] = useState(true);
  const [rightAdvertDismissed, setRightAdvertDismissed] = useState(false);
  const theme = useCurrentTheme();
  const appIconSrc = "./assets/logo.png";

  return (
    <Page>
      <Page.Header>
        {/* <Header /> */}
        <AppHeader>
          {/* <span className="tinyText">{demoMode ? "(showing mock data)" : ""}</span> */}
          {/* <Switch value={demoMode} onChange={setDemoMode}>
            Demo mode
          </Switch> */}
          <AppHeader.ActionItems>
            <AppHeader.ActionButton
            isSelected
              prefixIcon={!demoMode ? <FavouriteIcon /> : <UnfavouriteIcon />}
              onClick={() => {
                setDemoMode((oldval) => !oldval);
              }}
            >
              Demo mode
            </AppHeader.ActionButton>
          </AppHeader.ActionItems>
        </AppHeader>
      </Page.Header>
      <Page.Main>
        <Flex flexDirection="column" alignItems="center" width="100%" gap={24} height="100%">
          {demoMode && (
            <Flex flexDirection="row" gap={16} width={980}>
              <Flex flexDirection="column">
                {/* TODO: replace Heading and Text content in this section */}
                <Flex gap={4} flexDirection="column">
                  <Heading>Monitoring Coverage</Heading>
                  <Text>
                    Visualize monitoring coverage by Dynatrace across the user's entire estate and take action to get to
                    100% quickly. In this sample app, you'll learn how to use the Smartscape topology queries, which you
                    can use to understand your environment and subsequently take large-scale action using SDKs.
                  </Text>
                </Flex>
                <Flex gap={4} flexDirection="column">
                  <Heading level={4}>This app demonstrates</Heading>
                  <List ordered={false}>
                    <Text>Explore data with Dynatrace Query Langauge (DQL)</Text>
                    <Text>Query the Smartscape topology</Text>
                    <Text>Aggregate and visualize the topology data in tables</Text>
                    <Text>Add permission scopes</Text>
                    <Text>Take action with SDKs</Text>
                  </List>
                </Flex>
              </Flex>
              <Flex alignSelf={"flex-start"}>
                <img src={appIconSrc} width="90px" height="90px" />
              </Flex>
            </Flex> 
          )}
          {/* TODO: Start your app's logic here */}
          <Flex flexDirection="column" width={1280}>
            <Coverage gen2Url={gen2Url} demoMode={demoMode} setDemoMode={setDemoMode} />
          </Flex>
          {/* End your app's logic here */}
          {demoMode && <MainViewCard />}
        </Flex>
      </Page.Main>
      {demoMode && (
        <Page.DetailView dismissed={rightAdvertDismissed} onDismissChange={setRightAdvertDismissed}>
          <Flex flexDirection="column" gap={16} paddingTop={32} paddingLeft={8} paddingRight={8}>
            <Flex gap={4} flexDirection="column">
              <Heading level={4}>Ready to develop?</Heading>
              <Text>Learn to write apps with Dynatrace Developer and the Dynatrace community.</Text>
            </Flex>
            <DetailViewCard
              href="https://developer.dynatrace.com/preview/getting-started/quickstart/"
              imgSrc={theme === "light" ? "./assets/DevPortalLogo_light@3x.png" : "./assets/DevPortalLogo_dark@3x.png"}
              headline="Learn to create apps"
              text="Dynatrace Developer shows you how"
            ></DetailViewCard>
            <DetailViewCard
              href="https://community.dynatrace.com/t5/Developers/ct-p/developers"
              imgSrc={theme === "light" ? "./assets/CommunityIcon_light@3x.png" : "./assets/CommunityIcon_dark@3x.png"}
              headline="Join Dynatrace Community"
              text="Ask questions, get answers, share ideas"
            ></DetailViewCard>
            <DetailViewCard
              href="https://github.com/Dynatrace/monitoring-coverage"
              imgSrc={theme === "light" ? "./assets/GitBranchIcon_light@3x.png" : "./assets/GitBranchIcon_dark@3x.png"}
              headline="Collaborate in GitHub"
              text="Start your own app by forking it on GitHub"
            ></DetailViewCard>
          </Flex>
        </Page.DetailView>
      )}
      <ToastContainer />
    </Page>
  );
};
