import type { CliOptions } from "@dynatrace/dt-app";

const config: CliOptions = {
  //CHANGE THIS TO POINT TO YOUR ENVIRONMENT:
  environmentUrl: "https://umsaywsjuo.dev.apps.dynatracelabs.com/",
  //environmentUrl: "https://oqr47576.sprint.apps.dynatracelabs.com/",
  icon: "./src/assets/logo.png",
  app: {
    name: "Monitoring Coverage",
    version: "0.0.8",
    description: "A sample app helping you get to 100% cloud coverage",
    id: "my.monitoring.coverage",
    scopes: [
      { name: "storage:metrics:read", comment: "default template" },
      { name: "environment-api", comment: "query entity model" },
      { name: "environment-api:deployment:download", comment: "OneAgent deployment" },
      { name: "environment-api:api-tokens:write", comment: "Create Installer token" },
      { name: "storage:entities:read", comment: "Required for Grail"}
    ],
  },
};

module.exports = config;
