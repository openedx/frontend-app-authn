import { useMutation } from '@tanstack/react-query';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { login } from './api';

// Error constants
export const FORBIDDEN_REQUEST = 'forbidden-request';
export const INTERNAL_SERVER_ERROR = 'internal-server-error';
export const TPA_AUTHENTICATION_FAILURE = 'tpa-authentication-failure';
export const INVALID_FORM = 'invalid-form-fields';

const useLogin = () => useMutation({
  mutationFn: login,
  onSuccess: (data) => {
    logInfo('Login successful', data);
  },
  onError: (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 400) {
        logInfo('Login failed with validation error', error);
      } else if (status === 403) {
        logInfo('Login failed with forbidden error', error);
      } else {
        logError('Login failed with server error', error);
      }
    } else {
      logError('Login failed with network error', error);
    }
  },
});

export {
  useLogin,
};
