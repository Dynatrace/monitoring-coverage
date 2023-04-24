import { useMutation } from '@tanstack/react-query';
import { Meta } from '../types/Meta';

type Config = { osType: string; installerType: string };

async function fetcher(config: Config) {
  return fetch(
    `/platform/classic/environment-api/v1/deployment/installer/agent/${config.osType}/${config.installerType}/latest`,
  )
    .then((res) => {
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res.blob();
    })
    .then((blob) => URL.createObjectURL(blob));
}

export function useDownloadOneAgent() {
  const meta: Meta = {
    errorTitle: 'Agent download failed.',
  };

  return useMutation({
    mutationFn: (config: Config) => {
      return fetcher(config);
    },
    meta,
    onSuccess: (url) => {
      const dlLink = document.createElement('a');
      dlLink.href = url;
      dlLink.download = 'oneagent.sh';
      document.body.appendChild(dlLink);
      dlLink.click();
      dlLink.parentNode?.removeChild(dlLink);
    },
  });
}
