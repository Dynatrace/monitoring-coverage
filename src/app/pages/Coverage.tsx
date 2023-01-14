import React from "react";
import { Flex, Heading } from "@dynatrace/wave-components-preview";
import { CloudTable } from "../components/CloudTable";
import { UnmonitoredHostTable } from "../components/UnmonitoredHostTable";

export const Coverage = () => {
    return (
        <Flex flexDirection="column">
            <Heading>Monitoring Coverage</Heading>
            <Flex flexDirection="column">
                <Flex flexDirection="row">
                    <div>Icon</div>
                    <Heading level={2}>Hybrid Cloud</Heading>
                </Flex>
                <CloudTable/>
            </Flex>
            <Flex flexDirection="column">
                <Flex flexDirection="row">
                    <div>Icon</div>
                    <Heading level={2}>Unmonitored Hosts</Heading>
                </Flex>
                <UnmonitoredHostTable/>
            </Flex>
        </Flex>
    )
}