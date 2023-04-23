import React, { ReactElement } from 'react';
import { Container, Flex, Surface, Text } from '@dynatrace/strato-components-preview';
import { ExternalLinkIcon } from '@dynatrace/strato-icons';

interface DetailsCardProps {
  /** Absolute or relative link for the Card */
  href: string;
  /** The src for the image to show. */
  icon: ReactElement;
  /** The title shown on the card. */
  title: string;
  /** The text shown on the Card. */
  text: string;
}

export const DetailsCard = ({ href, icon, title, text }: DetailsCardProps) => {
  return (
    <Surface interactive as='a' target='_blank' href={href} rel='noopener noreferrer' padding={8} aria-label='advert'>
      <Flex flexDirection='row' alignItems='center' gap={12}>
        <Container as={Flex} flexShrink={0} alignItems='center' justifyContent='center'>
          {icon}
        </Container>
        <Flex flexDirection={'column'} gap={4} flexGrow={1}>
          <Text textStyle='base-emphasized'>{title}</Text>
          <Text textStyle={'small'}>{text}</Text>
        </Flex>
        <ExternalLinkIcon />
      </Flex>
    </Surface>
  );
};
