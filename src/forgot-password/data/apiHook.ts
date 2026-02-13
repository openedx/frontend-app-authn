import { logError, logInfo } from '@edx/frontend-platform/logging';
import { useMutation } from '@tanstack/react-query';

import { forgotPassword } from './api';

interface ForgotPasswordResult {
  success: boolean;
  message?: string;
}

interface UseForgotPasswordOptions {
  onSuccess?: (data: ForgotPasswordResult, email: string) => void;
  onError?: (error: Error) => void;
}

interface ApiError {
  response?: {
    status: number;
    data: Record<string, unknown>;
  };
}

const useForgotPassword = (options: UseForgotPasswordOptions = {}) => useMutation({
  mutationFn: (email: string) => (
    forgotPassword(email)
  ),
  onSuccess: (data: ForgotPasswordResult, email: string) => {
    if (options.onSuccess) {
      options.onSuccess(data, email);
    }
  },
  onError: (error: ApiError) => {
    // Handle different error types like the saga did
    if (error.response && error.response.status === 403) {
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
  useForgotPassword,
};
