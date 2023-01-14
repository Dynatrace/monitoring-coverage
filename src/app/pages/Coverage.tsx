import React from "react";
import { Flex, Heading } from "@dynatrace/wave-components-preview";

export const Coverage = () => {
    return (
        <Flex flexDirection="column">
            <Heading>Monitoring Coverage</Heading>
            <Flex flexDirection="column">
                <Flex flexDirection="row">
                    <div>Icon</div>
                    <Heading level={2}>Hybrid Cloud</Heading>
                </Flex>
                <div>Cloud table</div>
            </Flex>
            <Flex flexDirection="column">
                <Flex flexDirection="row">
                    <div>Icon</div>
                    <Heading level={2}>Unmonitored Hosts</Heading>
                </Flex>
                <div>Unmonitored hosts table</div>
            </Flex>
        </Flex>
    )
}