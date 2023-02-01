import React, {useEffect} from "react";
import { Flex, Heading } from "@dynatrace/wave-components-preview";
import { CloudTable } from "../components/CloudTable";
import { UnmonitoredHostTable } from "../components/UnmonitoredHostTable";
import { useDQLQuery } from "../hooks/useDQLQuery";

export const Coverage = () => {
    // const { error, result, fetchQuery, queryState, visualRecommendations } = useDQLQuery();
    const oneAgentHostsQuery = useDQLQuery();
    const cloudHostsQuery = useDQLQuery();
    const awsHostsQuery = useDQLQuery();
    const azureHostsQuery = useDQLQuery();
    const gcpHostsQuery =  useDQLQuery();
    const vmwareHostsQuery = useDQLQuery();

    useEffect(()=>{
        oneAgentHostsQuery.fetchQuery(
            `fetch dt.entity.host
            | filter cloudType <> "" OR hypervisorType == "VMWARE"
            | fieldsAdd cloud = if(cloudType <> "", cloudType, else:"VMWare")
            | summarize by:{cloud}, count()`
        );
        cloudHostsQuery.fetchQuery(
            `fetch metrics
            | filter in(metric.key,"dt.cloud.aws.ec2.cpu.usage","dt.cloud.azure.vm.cpu_usage","cloud.gcp.compute_googleapis_com.guest.cpu.usage_time","dt.cloud.vmware.vm.cpu.usage")
            | fieldsAdd entityId = if(dt.source_entity<>"",
            dt.source_entity,
            else: if(dt.entity.azure_vm<>"",dt.entity.azure_vm,else:\`dt.entity.cloud:gcp:gce_instance\`))
            | summarize by:{metric.key,entityId}, count()
            | summarize by:metric.key, count()`
        )
        awsHostsQuery.fetchQuery(
            `fetch dt.entity.EC2_INSTANCE
            | filterOut in(entityId,entitySelector("type(EC2_INSTANCE),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
            | fieldsAdd detectedName, ipAddress = localIp`
        );
        azureHostsQuery.fetchQuery(
            `fetch dt.entity.azure_vm
            | filterOut in(entityId,entitySelector("type(azure_vm),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
            | fieldsAdd detectedName, ipAddress = ipAddress[0]`
        );
        gcpHostsQuery.fetchQuery(
            `fetch \`dt.entity.cloud:gcp:gce_instance\`
            | lookup [fetch \`dt.entity.host\` 
            | filter gceInstanceId <> "" 
            | fieldsAdd instance_id=gceInstanceId], lookupField: gceInstanceId, sourceField:entityName
            | filter isNull(lookup.entityId)
            //| fieldsAdd ipAddress`
        );
        vmwareHostsQuery.fetchQuery(
            `fetch dt.entity.virtualmachine
            | fieldsAdd ip = ipAddress[0]
            | lookup [fetch dt.entity.host | filter in(entityId,entitySelector("type(host),fromRelationships.runsOn(type(virtualmachine))")) | fieldsAdd ip = ipAddress[0]], lookupField: ip, sourceField:ip
            | filter isNull(lookup.ip)`
        )
    },[])

    return (
        <Flex flexDirection="column">
            <Heading>Monitoring Coverage</Heading>
            <Flex flexDirection="column">
                <Flex flexDirection="row">
                    <div>Icon</div>
                    <Heading level={2}>Hybrid Cloud</Heading>
                </Flex>
                <CloudTable {...{oneAgentHostsQuery, cloudHostsQuery, awsHostsQuery, azureHostsQuery, gcpHostsQuery, vmwareHostsQuery}}/>
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