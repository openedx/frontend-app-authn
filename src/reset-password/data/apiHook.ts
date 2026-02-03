import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useMutation } from '@tanstack/react-query';

import { resetPassword, validateToken } from './api';
import { PASSWORD_RESET, PASSWORD_VALIDATION_ERROR } from './constants';

interface ResetPasswordPayload {
  formPayload: Record<string, any>;
  token: string;
  params: Record<string, any>;
}

const useValidateToken = () =>
  useMutation({
    mutationFn: async (token: string) => {
      const data = await validateToken(token);
      return { ...data, token };
    },
    onSuccess: (data) => {
      const { is_valid: isValid, token } = data;
      if (isValid) {
        logInfo(`Token ${token} is valid`);
      } else {
        logInfo(`Token ${token} is invalid`);
      }
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 429) {
        logInfo(error);
      } else {
        logError(error);
      }
    },
  });

const useResetPassword = () =>
  useMutation({
    mutationFn: async ({ formPayload, token, params }: ResetPasswordPayload) => {
      return await resetPassword(formPayload, token, params);
    },
    onSuccess: (data) => {
      const { reset_status: resetStatus, err_msg: resetErrors, token_invalid: tokenInvalid } = data;
      
      if (resetStatus) {
        logInfo('Password reset successful');
      } else if (tokenInvalid) {
        logInfo('Password reset failed: invalid token');
      } else {
        logInfo('Password reset failed: validation error', resetErrors);
      }
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 429) {
        logInfo(error);
      } else {
        logError(error);
      }
    },
  });
export {
  useValidateToken,
  useResetPassword,
};
