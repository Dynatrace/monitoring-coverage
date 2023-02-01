# Monitoring Coverage tutorial app

This is a project to demonstrate how to use DQL to query the entity model, visualize the data, and take action.
The app helps users understand what hosts are _not_ monitored by Dynatrace today.

# Let's find the data with DQL

To build this app together, we'll start by creating some DQL queries in a Notebook.

## HybridCloud coverage

Before we get into Monitoring Candidates, we need to make sure relavent Hybridcloud integrations are configured.

### Which clouds are we using?

Let's start by finding out which clouds Dynatrace has detected we're using:

```
fetch dt.entity.host
| filter cloudType <> "" OR hypervisorType == "VMWARE"
| fieldsAdd cloudType
| summarize by:{cloudType}, count()
```

We can see from the results that Dynatrace uses `EC2`, `AZURE`, and `GOOGLE_CLOUD_PLATFORM` for AWS, Azure, and GCP.

### Are integrations enabled for our clouds?

<magic/>

## Unmonitored Hosts

Now let's find out what hosts we know about through the cloud integrations but do not yet have a OneAgent.

### EC2s

```
fetch dt.entity.EC2_INSTANCE
| filterOut in(entityId,entitySelector("type(EC2_INSTANCE),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
| fieldsAdd detectedName, ipAddress = localIp
```

### Azure VMs

```
fetch dt.entity.azure_vm
| filterOut in(entityId,entitySelector("type(azure_vm),toRelationships.runsOn(type(host),isMonitoringCandidate(false))"))
| fieldsAdd detectedName, ipAddress = ipAddress[0]
```

### GCP CE VMs

Pending `lookup`:

```
fetch `dt.entity.cloud:gcp:gce_instance`
| fieldsAdd instanceId = instance_id OR entityName
| lookup [fetch `dt.entity.host` | filter gceInstanceId <> "" |fieldsAdd instance_id=gceInstanceId, hostEntityId = entityId], lookupFIeld: hostEntityId, sourceField:instance_id
| filter lookup.hostEntityId == ""
| fieldsAdd ipAddress
```

### VMWare VMs
Pending `lookup`:
```
fetch dt.entity.virtualmachine
| fieldsAdd ipAddress[0]
| lookup [fetch dt.entity.host | filter in(entityId,entitySelector("type(host),fromRelationships.runsOn(type(virtualmachine))")) | fieldsAdd ip = ipAddress[0]], lookupField: ip, sourceField:ip
| filter lookup.ip == ""
```

# Let's build an app

So now we have all of our data, let's make it easy for our whole team to use it with an app.

## Create from template

Follow directions on https://developer.dynatrace.com/preview/getting-started/quickstart/ to create an app

## Let's sketch out our UI

Create a new Page `Coverage.tsx`.

### Add our necessary imports

```
import React, {useState} from "react";
import { Flex, Heading } from "@dynatrace/wave-components-preview";

export const Coverage = () => {
    return (

    )
}
```

### Sketch the UI
We will use `Flex` components for creating columns and rows and for positioning. We'll just leave placeholders for Icon and Table components that'll create next.
```
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
```
Run your app now with `npm run start` to see how it looks.

### Sketch tables
Next, create components `CloudTable` and `UnmonitoredHostTable`:
```
<div>
    <DataTable columns={columns} data={data} />
    <Modal title={`Add integration`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
    <Flex flexDirection="column">
        <span>Get info from user here:</span>
        <Flex flexItem flexGrow={0}>
        <Button
            variant="primary"
            onClick={() => {
            setModalOpen(false);
            }}
        >
            Connect
        </Button>
        </Flex>
    </Flex>
    </Modal>
</div>
```

After you've imported the necessary components `DataTable`, `Modal`, `Flex`, and `Button` you'll notice you still have other unresolved symbols. We need a state variable to tell whether our popup, or modal, is open or not. Let's import `useState` from React and add it above the `return` in our component, like this:
```
export const CloudTable = () => {
  const [modalOpen, setModalOpen] = useState(false);
  ...
```

You'll also notice that `DataTable` wants some inputs. For now, just stub out your tables with some fake values, like so:
```
  const columns = useMemo<TableColumn[]>(
    () => [
      { accessor: "cloud" },
      { accessor: "status" },
      { accessor: "hosts" },
      {
        header: "Actions",
        cell: () => {
          return (
            <Flex>
              <Button
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                Setup
              </Button>
            </Flex>
          );
        },
      },
    ],
    []
  );
  const data = [
    { cloud: "AWS", status: "??", hosts: "??" },
    { cloud: "Azure", status: "??", hosts: "??" },
    { cloud: "GCP", status: "??", hosts: "??" },
    { cloud: "VMWare", status: "??", hosts: "??" },
  ];
```

Let's also replace the placeholders `<div>`s in our page with our new components and run our app again.

## Create hooks for our data

A hook allows us to change our app's state based on our process for getting the data. The template already includes a `useDQLQuery` hook which we can adapt, or we could create our own. For simplicity, let's use the one we already have and call it multiple times.
```
//  const { error, result, fetchQuery, queryState, visualRecommendations } = useDQLQuery();
    const cloudsQuery = useDQLQuery();
    const awsHostsQuery = useDQLQuery();
    const azureHostsQuery = useDQLQuery();
    const gcpHostsQuery =  useDQLQuery();
    const vmwareHostsQuery = useDQLQuery();
```
Now we want to run each of the queries when the component is loaded, but only once. We'll use React's built-in hook `useEffect` for this:
```
useEffect(()=>{
        cloudsQuery.fetchQuery(...);
        awsHostsQuery.fetchQuery(...);
        azureHostsQuery.fetchQuery(...);
        gcpHostsQuery.fetchQuery(...);
        vmwareHostsQuery.fetchQuery(...);
    },[])
```
The empty dependency brackets in `useEffect` tells to run only once when the component is first loaded. For `fetchQuery` we'll use the DQL queries from our Notebook.