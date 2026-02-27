import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useMutation } from '@tanstack/react-query';

import { resetPassword, validateToken } from './api';

interface ResetPasswordPayload {
  formPayload: Record<string, string | boolean>;
  token: string;
  params: Record<string, string>;
}

interface TokenValidationResult {
  is_valid: boolean;
  token: string;
}

interface ResetPasswordResult {
  reset_status: boolean;
  err_msg?: Record<string, string[]>;
  token_invalid?: boolean;
}

interface UseValidateTokenOptions {
  onSuccess?: (data: TokenValidationResult) => void;
  onError?: (error: Error) => void;
}

interface UseResetPasswordOptions {
  onSuccess?: (data: ResetPasswordResult) => void;
  onError?: (error: Error) => void;
}

interface ApiError {
  response?: {
    status: number;
    data: Record<string, unknown>;
  };
}

const useValidateToken = (options: UseValidateTokenOptions = {}) => useMutation({
  mutationFn: async (token: string) => {
    const data = await validateToken(token);
    return { ...data, token };
  },
  onSuccess: (data: TokenValidationResult) => {
    const { is_valid: isValid, token } = data;
    if (isValid) {
      logInfo(`Token ${token} is valid`);
    } else {
      logInfo(`Token ${token} is invalid`);
    }
    if (options.onSuccess) {
      options.onSuccess(data);
    }
  },
  onError: (error: ApiError) => {
    if (error.response && error.response.status === 429) {
      logInfo(error);
    } else {
      logError(error);
    }
    if (options.onError) {
      options.onError(error as Error);
    }
  },
});

const useResetPassword = (options: UseResetPasswordOptions = {}) => useMutation({
  mutationFn: ({ formPayload, token, params }: ResetPasswordPayload) => (
    resetPassword(formPayload, token, params)
  ),
  onSuccess: (data: ResetPasswordResult) => {
    const { reset_status: resetStatus, err_msg: resetErrors, token_invalid: tokenInvalid } = data;
    if (resetStatus) {
      logInfo('Password reset successful');
    } else if (tokenInvalid) {
      logInfo('Password reset failed: invalid token');
    } else {
      logInfo('Password reset failed: validation error', resetErrors);
    }
    if (options.onSuccess) {
      options.onSuccess(data);
    }
  },
  onError: (error: ApiError) => {
    if (error.response && error.response.status === 429) {
      logInfo(error);
    } else {
      logError(error);
    }
    if (options.onError) {
      options.onError(error as Error);
    }
  },
});

export {
  useValidateToken,
  useResetPassword,
};
