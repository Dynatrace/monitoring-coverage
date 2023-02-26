import { Page } from '@dynatrace/wave-components-preview';
import React,{useState} from 'react';
import { Route, Routes } from 'react-router-dom';
import { coreClient } from '@dynatrace-sdk/client-core';
import { Data } from './pages/Data';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Coverage } from './pages/Coverage';

export const App = () => {
  const [apiUrl,setApiUrl] = useState<string>("");
  const [gen2Url,setGen2Url] = useState<string>("");
  coreClient.getEnvironmentApiInfo().then(url=>{
    setApiUrl(url.endpoint)
    setGen2Url(url.endpoint.replace(/\.apps\./, ""));
  })
  return (
    <Page variant="centered">
      <Page.Header>
        <Header />
      </Page.Header>
      <Page.Main>
        <Routes>
          <Route path="/" element={<Coverage apiUrl={apiUrl} gen2Url={gen2Url}/>} />
          <Route path="/data" element={<Data />} />
        </Routes>
      </Page.Main>
    </Page>
  );
};
