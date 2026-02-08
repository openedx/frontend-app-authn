import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useMutation } from '@tanstack/react-query';

import { getThirdPartyAuthContext } from './api';

// Error constants
export const THIRD_PARTY_AUTH_ERROR = 'third-party-auth-error';

const useThirdPartyAuthHook = () => useMutation({
  mutationFn: getThirdPartyAuthContext,
  onSuccess: () => {
    logInfo('Third party auth context fetched successfully');
  },
  onError: (error) => {
    logError('Third party auth context failed', error);
  },
});

export {
  useThirdPartyAuthHook,
};
