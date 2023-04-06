import React from "react";
import {
  ExternalLink,
  Flex,
  Heading,
  Text,
} from '@dynatrace/strato-components-preview';
import Colors from '@dynatrace/strato-design-tokens/colors';
import Spacings from '@dynatrace/strato-design-tokens/spacings';
import Borders from '@dynatrace/strato-design-tokens/borders';


export const MainViewCard = () => {
  return (
    // TODO: Replace styled Flex with Container component from the design system as soon as it's available for all customers
    (<Flex
      style={{
        borderStyle: `${Borders.Style.Default}`,
        borderWidth: `${Borders.Width.Emphasized}`,
        borderRadius: `${Borders.Radius.Container.Default}`,
        borderColor: `${Colors.Border.Primary.Default}`,
        color: `${Colors.Text.Primary.Default}`,
        backgroundColor: `${Colors.Background.Container.Primary.Default}`,
        padding: `${Spacings.Size12} ${Spacings.Size16}`,
      }}
      flexWrap="wrap" gap={16}
    >
      <Flex flexGrow={1}>
        <Flex alignSelf={"center"} flexDirection="column" gap={4}>
          <Heading level={6}>What's next?</Heading>
          <Text>
            Fork this app on GitHub and learn how to write apps for Dynatrace.
          </Text>
        </Flex>
      </Flex>
      <Flex justifyContent="center" alignSelf={"center"}> 
          {/* TODO: replace href with actual link to the repository */}
          <ExternalLink href="https://www.github.com/dynatrace/monitoring-coverage">Fork on Github</ExternalLink>       
      </Flex>
    </Flex>)
  );
};
