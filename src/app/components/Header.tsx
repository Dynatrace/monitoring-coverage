import {
  AppHeader,
  AppName,
  Flex,
  Divider,
  Button
} from '@dynatrace/strato-components-preview/';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const Header = () => {
  return (
    <AppHeader>
      <Flex alignItems="center">
        <AppName />
        <Divider orientation="vertical" />
        <Button as={RouterLink} to="/" variant="default">
          Home
        </Button>
        <Button as={RouterLink} to="/data" variant="default">
          Explore data
        </Button>
      </Flex>
    </AppHeader>
  );
};
