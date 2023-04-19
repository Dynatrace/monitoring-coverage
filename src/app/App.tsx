import {
  ToastContainer,
  Page,
  AppHeader,
  Flex,
} from "@dynatrace/strato-components-preview";
import React, { useState } from "react";
import { FavouriteIcon, UnfavouriteIcon } from "@dynatrace/strato-icons";
import { WhatsNext } from "./components/WhatsNext";
import { DemoModeProvider } from "./hooks/useDemoMode";
import { AppIntro } from "./components/demo/AppIntro";
import { DetailView } from "./components/demo/DetailView";
import { CloudTable } from "./components/CloudTable";

export const App = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [rightAdvertDismissed, setRightAdvertDismissed] = useState(false);

  return (
    <Page>
      <Page.Header>
        <AppHeader>
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

        <Flex
          flexDirection="column"
          alignItems="center"
          width="100%"
          gap={24}
        >
          {demoMode && <AppIntro />}
          <Flex flexDirection="column" width={1280}>
            <DemoModeProvider demoMode={demoMode}>
              <CloudTable />
            </DemoModeProvider>
          </Flex>
          {demoMode && <WhatsNext />}
        </Flex>
      </Page.Main>
      {demoMode && (
        <Page.DetailView
          dismissed={rightAdvertDismissed}
          onDismissChange={setRightAdvertDismissed}
        >
          <DetailView />
        </Page.DetailView>
      )}
      <ToastContainer />
    </Page>
  );
};
