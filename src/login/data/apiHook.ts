import { useMutation } from '@tanstack/react-query';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { login } from './api';
import { camelCaseObject } from '@edx/frontend-platform/utils';

// Error constants
export const FORBIDDEN_REQUEST = 'forbidden-request';
export const INTERNAL_SERVER_ERROR = 'internal-server-error';
export const TPA_AUTHENTICATION_FAILURE = 'tpa-authentication-failure';
export const INVALID_FORM = 'invalid-form-fields';

const useLogin = () => useMutation({
  mutationFn: async (loginData) => {
    try {
      return await login(loginData);
    } catch (error) {
      let transformedError = { errorCode: INTERNAL_SERVER_ERROR, context: {} };
      
      if (error.response) {
        const { status } = error.response;
        
        if (status === 400) {
          // Validation errors - include the response data in camelCase
          transformedError = {
            errorCode: INVALID_FORM,
            context: camelCaseObject(error.response.data || {}),
          };
          logInfo('Login failed with validation error', error);
        } else if (status === 403) {
          transformedError = { errorCode: FORBIDDEN_REQUEST, context: {} };
          logInfo('Login failed with forbidden error', error);
        } else {
          transformedError = { errorCode: INTERNAL_SERVER_ERROR, context: {} };
          logError('Login failed with server error', error);
        }
      } else {
        logError('Login failed with network error', error);
      }
      
      // Throw the transformed error
      throw transformedError;
    }
  },
  onSuccess: (data) => {
    logInfo('Login successful', data);
  },
});

export {
  useLogin,
};
