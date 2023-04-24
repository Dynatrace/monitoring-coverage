import {
  ApiTokenCreate,
  ApiTokenCreateScopesItem,
  accessTokensApiTokensClient,
} from '@dynatrace-sdk/client-classic-environment-v2';

const tokens = new WeakMap<ApiTokenCreate, string>();

async function getToken(config: ApiTokenCreate) {
  if (tokens.has(config)) {
    return tokens.get(config) as string;
  }
  const res = await accessTokensApiTokensClient.createApiToken({ body: config });
  if (res.token === undefined) {
    throw new Error('Token missing.');
  }
  tokens.set(config, res.token);
  return tokens.get(config) as string;
}

export function getSettingsWriterToken() {
  return getToken({
    scopes: [ApiTokenCreateScopesItem.WriteConfig],
    name: 'Settings writer from Monitoring Coverage for Cloud APIs',
    expirationDate: 'now+1h',
  });
}

export function getInstallerDownloadToken() {
  return getToken({
    scopes: [ApiTokenCreateScopesItem.InstallerDownload],
    name: 'Installer token created from Monitoring Coverage',
    expirationDate: 'now+1d',
  });
}
