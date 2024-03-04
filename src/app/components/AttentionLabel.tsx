import React from 'react';
import { Flex } from '@dynatrace/strato-components-preview';
import { ArrowRightIcon, CheckmarkIcon } from '@dynatrace/strato-icons';
import Colors from '@dynatrace/strato-design-tokens/colors';

type AttentionLabelProps = {
  sectionsCopied: string[];
  text: string;
};

export const AttentionLabel = ({ sectionsCopied, text }: AttentionLabelProps) => {
  if (!sectionsCopied.includes(text)) {
    return (
      <Flex flexDirection='row' style={{ color: Colors.Text.Primary.Default }}>
        <ArrowRightIcon /> {text}
      </Flex>
    );
  } else {
    return (
      <Flex flexDirection='row' alignContent='baseline' style={{ color: Colors.Text.Success.Default }}>
        <CheckmarkIcon /> {text}
      </Flex>
    );
  }
};
