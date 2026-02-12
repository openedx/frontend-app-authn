import { logError, logInfo } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useMutation } from '@tanstack/react-query';

import { login } from './api';

// Error constants
export const FORBIDDEN_REQUEST = 'forbidden-request';
export const INTERNAL_SERVER_ERROR = 'internal-server-error';
export const TPA_AUTHENTICATION_FAILURE = 'tpa-authentication-failure';
export const INVALID_FORM = 'invalid-form-fields';

// Type definitions
interface LoginData {
  email_or_username: string;
  password: string;
}

interface LoginResponse {
  redirectUrl?: string;
}

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: unknown) => void;
}

const useLogin = (options: UseLoginOptions = {}) => useMutation<LoginResponse, unknown, LoginData>({
  mutationFn: async (loginData: LoginData) => login(loginData) as Promise<LoginResponse>,
  onSuccess: (data: LoginResponse) => {
    logInfo('Login successful', data);
    if (options.onSuccess) {
      options.onSuccess(data);
    }
  },
  onError: (error: unknown) => {
    logError('Login failed', error);
    let formattedError = {
      type: INTERNAL_SERVER_ERROR,
      context: {},
      count: 0,
    };
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const response = error.response as { status?: number; data?: unknown };
      const { status, data } = camelCaseObject(response);
      if (data && typeof data === 'object') {
        const errorData = data as { errorCode?: string; context?: { failureCount?: number } };
        formattedError = {
          type: errorData.errorCode || FORBIDDEN_REQUEST,
          context: errorData.context || {},
          count: errorData.context?.failureCount || 0,
        };
        if (status === 400) {
          logInfo('Login failed with validation error', error);
        } else if (status === 403) {
          logInfo('Login failed with forbidden error', error);
        } else {
          logError('Login failed with server error', error);
        }
      }
    }
    if (options.onError) {
      options.onError(formattedError);
    }
  },
});
export {
  useLogin,
};
