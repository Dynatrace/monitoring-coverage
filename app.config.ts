import type { CliOptions } from 'dt-app';
import { LATEST_DYNATRACE_ENVIRONMENT_URL } from 'env';

const config: CliOptions = {
  environmentUrl: LATEST_DYNATRACE_ENVIRONMENT_URL,
  icon: './src/assets/logo.png',
  app: {
    name: 'Monitoring Coverage',
    version: '0.0.17',
    description: 'A sample app helping you get to 100% cloud coverage',
    id: 'my.monitoring.coverage',
    scopes: [
      { name: 'storage:metrics:read', comment: 'default template' },
      { name: 'environment-api', comment: 'query entity model' },
      { name: 'environment-api:deployment:download', comment: 'OneAgent deployment' },
      { name: 'environment-api:api-tokens:write', comment: 'Create Installer token' },
      { name: 'storage:entities:read', comment: 'Required for Grail' },
      { name: 'environment-api:credentials:read', comment: 'Required for retrieving a secret' },
      { name: 'settings:objects:write', comment: 'Required for writing settings'}
    ],
    pageTokens: {
      root: '/',
    },
  },
};

module.exports = config;
