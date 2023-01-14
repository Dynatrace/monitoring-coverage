import { Page } from '@dynatrace/wave-components-preview/layouts';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Data } from './pages/Data';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Coverage } from './pages/Coverage';

export const App = () => {
  return (
    <Page variant="centered">
      <Page.Header>
        <Header />
      </Page.Header>
      <Page.Main>
        <Routes>
          <Route path="/" element={<Coverage />} />
          <Route path="/data" element={<Data />} />
        </Routes>
      </Page.Main>
    </Page>
  );
};
