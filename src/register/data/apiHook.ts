import { camelCaseObject } from '@edx/frontend-platform';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useMutation } from '@tanstack/react-query';

import { getFieldsValidations, registerNewUserApi } from './api';
import { INTERNAL_SERVER_ERROR } from './constants';

interface RegistrationPayload {
  [key: string]: unknown;
}

interface AuthenticatedUser {
  username: string;
  full_name: string;
  user_id: number;
}

interface RegistrationResponse {
  redirectUrl: string;
  success: boolean;
  authenticatedUser: AuthenticatedUser;
}

interface UseRegistrationOptions {
  onSuccess?: (data: RegistrationResponse) => void;
  onError?: (error: unknown) => void;
}

interface FieldValidationsPayload {
  [key: string]: unknown;
}

interface UseFieldValidationsOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

const useRegistration = (options: UseRegistrationOptions = {}) => useMutation({
  mutationFn: (registrationPayload: RegistrationPayload) => (
    registerNewUserApi(registrationPayload)
  ),
  onSuccess: (data: RegistrationResponse) => {
    if (options.onSuccess) {
      options.onSuccess(data);
    }
  },
  onError: (error: unknown) => {
    const statusCodes = [400, 403, 409];
    let errorData: unknown;

    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const response = error.response as { status?: number; data?: unknown };
      if (response.status && statusCodes.includes(response.status)) {
        errorData = camelCaseObject(response.data || {});
        logInfo(error);
      } else {
        errorData = { errorCode: INTERNAL_SERVER_ERROR };
        logError(error);
      }
    } else {
      errorData = { errorCode: INTERNAL_SERVER_ERROR };
      logError(error);
    }

    if (options.onError) {
      options.onError(errorData);
    }
  },
});

const useFieldValidations = (options: UseFieldValidationsOptions = {}) => useMutation({
  mutationFn: (payload: FieldValidationsPayload) => (
    getFieldsValidations(payload)
  ),
  onSuccess: (data: unknown) => {
    const transformedData = camelCaseObject((data as { fieldValidations: unknown }).fieldValidations);
    if (options.onSuccess) {
      options.onSuccess(transformedData);
    }
  },
  onError: (error: unknown) => {
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const response = error.response as { status?: number };
      if (response.status === 403) {
        logInfo(error);
        if (options.onError) {
          options.onError({ validationApiRateLimited: true });
        }
      } else {
        logError(error);
        if (options.onError) {
          options.onError(error);
        }
      }
    } else {
      logError(error);
      if (options.onError) {
        options.onError(error);
      }
    }
  },
});

export {
  useRegistration,
  useFieldValidations,
};
