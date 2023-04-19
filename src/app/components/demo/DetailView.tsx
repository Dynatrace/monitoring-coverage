import { Flex, Heading, Text } from '@dynatrace/strato-components-preview';
import { CodeIcon, ChatIcon } from '@dynatrace/strato-icons';
import React from 'react';
import { GithubIcon } from 'src/app/icons/GithubIcon';
import { DetailsCard } from './DetailsCard';

export const DetailView = () => {
  return (
    <Flex flexDirection='column' gap={16} paddingTop={32} paddingLeft={8} paddingRight={8}>
      <Flex gap={4} flexDirection='column'>
        <Heading level={4}>Ready to develop?</Heading>
        <Text>Learn to write apps with Dynatrace Developer and the Dynatrace community.</Text>
      </Flex>
      <DetailsCard
        href='https://dynatrace.dev/'
        icon={<CodeIcon />}
        title='Learn to create apps'
        text='Dynatrace Developer shows you how'
      />
      <DetailsCard
        href='https://community.dynatrace.com/'
        icon={<ChatIcon />}
        title='Join Dynatrace Community'
        text='Ask questions, get answers, share ideas'
      />
      <DetailsCard
        href='https://github.com/Dynatrace/monitoring-coverage'
        icon={<GithubIcon />}
        title='Collaborate in GitHub'
        text='Start your own app by cloning it on Github'
      />
    </Flex>
  );
};
