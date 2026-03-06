import { camelCaseObject, logError, logInfo } from '@openedx/frontend-base';
import { useMutation } from '@tanstack/react-query';

import { getFieldsValidations, registerNewUserApi } from './api';
import { INTERNAL_SERVER_ERROR } from './constants';

type RegistrationPayload = Record<string, unknown>;

interface AuthenticatedUser {
  username: string,
  full_name: string,
  user_id: number,
}

interface RegistrationResponse {
  redirectUrl: string,
  success: boolean,
  authenticatedUser: AuthenticatedUser,
}

interface UseRegistrationOptions {
  onSuccess?: (data: RegistrationResponse) => void,
  onError?: (error: unknown) => void,
}

interface ApiError extends Error {
  response?: {
    status: number,
    data?: unknown,
  },
}

type FieldValidationsPayload = Record<string, unknown>;

interface UseFieldValidationsOptions {
  onSuccess?: (data: unknown) => void,
  onError?: (error: unknown) => void,
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
  onError: (error: ApiError) => {
    const statusCodes = [400, 403, 409];
    let errorData: unknown;

    if (error.response) {
      if (error.response.status && statusCodes.includes(error.response.status)) {
        errorData = camelCaseObject(error.response.data || {});
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
  onError: (error: ApiError) => {
    if (error.response) {
      if (error.response.status === 403) {
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
