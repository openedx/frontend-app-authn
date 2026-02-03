import { camelCaseObject } from '@edx/frontend-platform';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useMutation } from '@tanstack/react-query';

import { getFieldsValidations, registerNewUserApi } from './api.ts';
import { INTERNAL_SERVER_ERROR } from './constants';

const useRegistration = (options = {}) => useMutation({
  mutationFn: (registrationPayload) => registerNewUserApi(registrationPayload),
  onSuccess: (data) => {
    const transformedData = {
      ...data,
      authenticatedUser: camelCaseObject(data.authenticatedUser),
    };
    options.onSuccess?.(transformedData);
  },
  onError: (error: any) => {
    const statusCodes = [400, 403, 409];
    let errorData;

    if (error.response && statusCodes.includes(error.response.status)) {
      errorData = camelCaseObject(error.response.data);
      logInfo(error);
    } else {
      errorData = { errorCode: INTERNAL_SERVER_ERROR };
      logError(error);
    }

    options.onError?.(errorData);
  },
});

const useFieldValidations = (options = {}) => useMutation({
  mutationFn: (payload) => getFieldsValidations(payload),
  onSuccess: (data) => {
    const transformedData = camelCaseObject(data.fieldValidations);
    options.onSuccess?.(transformedData);
  },
  onError: (error: any) => {
    if (error.response && error.response.status === 403) {
      logInfo(error);
      options.onError?.({ validationApiRateLimited: true });
    } else {
      logError(error);
      options.onError?.(error);
    }
  },
});

export {
  useRegistration,
  useFieldValidations,
};
