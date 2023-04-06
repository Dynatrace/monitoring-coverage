import {
  ToastContainer,
  _NewPage as Page,
  AppHeader,
  Flex,
  Heading,
  Text,
  useCurrentTheme,
} from "@dynatrace/strato-components-preview";
import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { coreClient } from "@dynatrace-sdk/client-core";
import { getEnvironmentUrl } from "@dynatrace-sdk/app-environment";
import { Header } from "./components/Header";
import { Coverage } from "./pages/Coverage";
import { DetailViewCard } from "./components/DetailViewCard";

export const App = () => {
  const [gen2Url, setGen2Url] = useState<string>(getEnvironmentUrl().replace(/\.apps/, ""));
  const [rightAdvertDismissed, setRightAdvertDismissed] = useState(false);
  const theme = useCurrentTheme();

  return (
    <Page>
      <Page.Header>
        {/* <Header /> */}
        <AppHeader></AppHeader>
      </Page.Header>
      <Page.Main>
        <Flex flexDirection="row" width="100%" justifyContent="center">
          <Flex flexDirection="column" padding={32} gap={32} width={1280} alignSelf={"center"}>
            <Coverage gen2Url={gen2Url} />
          </Flex>
        </Flex>
        {/* <Routes>
          <Route path="/" element={<Coverage gen2Url={gen2Url}/>} />
        </Routes> */}
      </Page.Main>
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
      <ToastContainer />
    </Page>
  );
};
