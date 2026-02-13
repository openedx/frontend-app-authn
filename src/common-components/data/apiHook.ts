import { useMutation, useQuery } from '@tanstack/react-query';

import { getThirdPartyAuthContext } from './api';

// Error constants
export const THIRD_PARTY_AUTH_ERROR = 'third-party-auth-error';

const useThirdPartyAuthHook = (payload) => useQuery({
  queryKey: ['thirdPartyAuthContext'],
  queryFn: () => getThirdPartyAuthContext(payload),
  retry: false,
});

export {
  useThirdPartyAuthHook,
};
