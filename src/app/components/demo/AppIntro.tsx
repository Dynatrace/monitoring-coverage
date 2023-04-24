import { Flex, Heading, List, Paragraph, Text } from '@dynatrace/strato-components-preview';
import React from 'react';

export const AppIntro = () => {
  return (
    <Flex flexDirection='row' gap={16} width={980} alignSelf='center'>
      <Flex flexDirection='column'>
        <Flex gap={4} flexDirection='column'>
          <Heading as='h1'>Monitoring Coverage</Heading>
          <Paragraph>
            Visualize monitoring coverage by Dynatrace across the user's entire estate and take action to get to 100%
            quickly. In this sample app, you'll learn how to use the Smartscape topology queries, which you can use to
            understand your environment and subsequently take large-scale action using SDKs.
          </Paragraph>
        </Flex>
        <Flex gap={4} flexDirection='column'>
          <Heading as='h2' level={4}>
            This app demonstrates
          </Heading>
          <List ordered={false}>
            <Text>Explore data with Dynatrace Query Langauge (DQL)</Text>
            <Text>Query the Smartscape topology</Text>
            <Text>Aggregate and visualize the topology data in tables</Text>
            <Text>Add permission scopes</Text>
            <Text>Take action with SDKs</Text>
          </List>
        </Flex>
      </Flex>
      <Flex alignSelf={'flex-start'}>
        <img src='./assets/logo.png' width='90px' height='90px' />
      </Flex>
    </Flex>
  );
};
