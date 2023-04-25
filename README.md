# Monitoring Coverage Sample App

This is a project to demonstrate how to use DQL to query the entity model, visualize the data, and take action.
The app helps users understand which hosts are _not_ monitored by Dynatrace today.
![Screenshots](./src/assets/monitoring-coverage.png)

## Support
Please note that the app is intended mostly for educational purposes and should not be used as-is for production scenarios. It is covered under the “light support” provisions of the Dynatrace terms and conditions.

## TL;DR
You can start using this Sample App now:
1. Clone this repo to your localhost
2. Edit `env.ts` to point to your environment
3. Test locally: `npm run start`
4. Deploy using `npm run deploy`

Or, keep reading to understand how to modify this app for your own purposes or build your own.

Or, watch our Observability Clinic about this app on YouTube:
[![Observability Clinic](src/assets/observability_clinic.png 'Observability Clinic')](https://www.youtube.com/watch?v=0cbdymD_2tc)

# Let's find the data with DQL

To build this app together, we'll start by creating some DQL queries in a Notebook.

## HybridCloud coverage

Before we get into Monitoring Candidates, we need to make sure relavent Hybridcloud integrations are configured.

### Which clouds are we using?

Let's start by finding out the number of OneAgent hosts for each cloud using:

```
fetch dt.entity.host
| filter cloudType <> "" OR hypervisorType == "VMWARE"
| fieldsAdd cloudType
| summarize by:{cloudType}, count()
```

We can see from the results that Dynatrace uses `EC2`, `AZURE`, and `GOOGLE_CLOUD_PLATFORM`, `VMWARE` for AWS, Azure, GCP, and VMWare.

<!--### Are integrations enabled for our clouds?

<magic/>-->

## Cloud Hosts

Now let's find out how many hosts we know about through the cloud integrations and also get a list of them filtered by which are not related to a OneAgent host:

### EC2s
```
fetch dt.entity.EC2_INSTANCE
| filter arn != ""
| summarize count(), alias:num
```

```
fetch dt.entity.EC2_INSTANCE
| fieldsAdd host=runs[dt.entity.host], entity.detected_name, ipAddress = localIp
| lookup [fetch dt.entity.host | fieldsAdd isMonitoringCandidate], sourceField:host, lookupField:id, prefix:"host."
| filterOut host.isMonitoringCandidate == false
| fields id, entity.name, entity.detected_name, ipAddress = localIp
```

### Azure VMs
```
fetch dt.entity.azure_vm
| summarize count(), alias:num
```

```
fetch dt.entity.azure_vm
| fieldsAdd host=runs[dt.entity.host], entity.detected_name, ipAddress
| lookup [fetch dt.entity.host | fieldsAdd isMonitoringCandidate], sourceField:host, lookupField:id, prefix:"host."
| filterOut host.isMonitoringCandidate == false
| fields id, entity.name, entity.detected_name, ipAddress
```

### GCP CE VMs
```
fetch \`dt.entity.cloud:gcp:gce_instance\`
| summarize count(), alias:num
```

```
fetch `fetch \`dt.entity.cloud:gcp:gce_instance\`
| lookup [fetch \`dt.entity.host\`
  | filter gceInstanceId <> ""
  | fieldsAdd instance_id=gceInstanceId], lookupField: gceInstanceId, sourceField:entity.name
| filter isNull(lookup.id)
//| fieldsAdd ipAddress
```

### VMWare VMs
```
fetch dt.entity.virtualmachine
| summarize count(), alias:num
```

```
fetch dt.entity.virtualmachine
| fieldsAdd ip = ipAddress[0]
| lookup [fetch dt.entity.host
  | filter in(id,entitySelector("type(host),fromRelationships.runsOn(type(virtualmachine))"))
  | fieldsAdd ip = ipAddress[0]], lookupField: ip, sourceField:ip
| filter isNull(lookup.ip)
| fields id, entity.name, ipAddress=ip
| limit 100000
```

# Let's build an app

So now we have all of our data, let's make it easy for our whole team to use it with an app.

## Create from template

Follow directions on https://developer.dynatrace.com/preview/getting-started/quickstart/ to create an app

## Use Strato components to sketch your UI

Strato has many prebuilt components from which to build your UI. This makes coding your app quick and
easy, and means it automatically has a native Dynatrace look and feel. For example, use `DataTable` for
presenting tabular data you get from DQL. Use `Button` for any number of user interactions. The [Developer Portal](https://developer.dynatrace.com/preview/reference/design-system/) also includes many examples of how to use each component. Be sure to hardcode some sample data into your app to make testing easier.

## Build hooks for your DQL queries

Now that you have a rough UI, let's take the DQL queries from our Notebook above and create a "hook" to use
that data in our app. The [Developer Portal](https://developer.dynatrace.com/preview/develop/data/query-and-visualize/)
also has many examples of how to query Grail and visualize the data in your app. Remember keeping your UI and data layers abstracted makes it easier to debug and maintain your app.

## Take action with SDKs

Dynatrace's SDKs wrap many of the APIs available in Dynatrace with an easy to use interface for your applications. You
can see all of the SDKs that are available on the [Developer Portal](https://developer.dynatrace.com/preview/reference/sdks/). These allow you to do many things like:
- Change Dynatrace settings
- Update ActiveGates and OneAgents
- Deploy extensions
just to name a few.

## Other packages

Your app isn't limited to just the packages that come from Dynatrace. This Sample App also uses a package called [TanStack Query](https://www.npmjs.com/package/@tanstack/react-query). This particular package makes it easy to cache query results and update state only when necessary. The ability to use Open Source packages means it is easy and straightforward to solve any problem with Dynatrace AppEngine. Be sure to leave us feedback on our [Developer Forum](https://community.dynatrace.com/t5/Developers/ct-p/developers) whenever you think we should add new visuals to Strato or functionality to SDKs!

## Test and deploy

When you run `npm run start` your app is running from your local workstation. This means you can test your app without affecting other users on your Dynatrace tenant. When you are ready to share with your colleagues, you can use `npx dt-app deploy` to deploy your app to your tenant. You will then see your app in the Apps menu in your Dynatrace tenant.

We hope you enjoyed this Sample App. See `CONTRIBUTING.md` if you would like to add features to it.
