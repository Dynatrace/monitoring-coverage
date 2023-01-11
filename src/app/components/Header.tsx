import {
  AppHeader,
  AppName,
  Flex,
} from '@dynatrace/wave-components-preview/layouts';
import { Divider } from '@dynatrace/wave-components-preview/typography';
import { Button } from '@dynatrace/wave-components-preview/buttons';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const Header = () => {
  return (
    <AppHeader>
      <Flex alignItems="center">
        <AppName />
        <Divider orientation="vertical" />
        <Button as={RouterLink} to="/" variant="minimal">
          Home
        </Button>
        <Button as={RouterLink} to="/data" variant="minimal">
          Explore data
        </Button>
      </Flex>
    </AppHeader>
  );
};
