import { useQuery } from '@tanstack/react-query';

import { getThirdPartyAuthContext } from './api';
import { ThirdPartyAuthQueryKeys } from './queryKeys';

// Error constants
export const THIRD_PARTY_AUTH_ERROR = 'third-party-auth-error';

const useThirdPartyAuthHook = (pageId, payload) => useQuery({
  queryKey: ThirdPartyAuthQueryKeys.byPage(pageId),
  queryFn: () => getThirdPartyAuthContext(payload),
  retry: false,
});

export {
  useThirdPartyAuthHook,
};
