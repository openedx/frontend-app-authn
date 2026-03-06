import { useQuery } from '@tanstack/react-query';

import { getThirdPartyAuthContext } from './api';
import { ThirdPartyAuthQueryKeys } from './queryKeys';

// Error constants
export const THIRD_PARTY_AUTH_ERROR = 'third-party-auth-error';

const useThirdPartyAuthHook = (pageId, payload) => useQuery({
  queryKey: ThirdPartyAuthQueryKeys.byPage(pageId, payload),
  queryFn: () => getThirdPartyAuthContext(payload),
  retry: false,
  staleTime: 5 * 60 * 1000, // 5 minutes — TPA context is effectively static per session
});

export {
  useThirdPartyAuthHook,
};
