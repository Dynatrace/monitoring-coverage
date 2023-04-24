import { useQuery } from '@tanstack/react-query';
import { Meta } from '../types/Meta';
import { getInstallerDownloadToken } from '../tokens';

export function useInstallerDownloadToken() {
  const meta: Meta = {
    errorTitle: 'Creating API token failed',
  };

  return useQuery({
    queryFn: getInstallerDownloadToken,
    queryKey: ['installer-download-token'],
    // token should be valid for one day
    staleTime: 24 * 60 * 60 * 1000,
    meta,
  });
}
