import type { CliOptions } from '@dynatrace/dtp-cli';

const config: CliOptions = {
  environmentUrl: 'https://umsaywsjuo.dev.apps.dynatracelabs.com/',
  app: {
    name: 'Monitoring Coverage',
    version: '0.0.0',
    description: 'A starting project with routing, fetching Grail™ data, and charting',
    id: 'my.monitoring.coverage',
    scopes: [{ name: 'storage:metrics:read', comment: 'default template' }]
  },
};

module.exports = config;