import { useMutation } from '@tanstack/react-query';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { forgotPassword } from './api';

const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return await forgotPassword(email);
    },
    onSuccess: (data, email) => {
      logInfo(`Forgot password email sent to ${email}`);
    },
    onError: (error: any) => {
      // Handle different error types like the saga did
      if (error.response && error.response.status === 403) {
        logInfo(error);
      } else {
        logError(error);
      }
    },
  });
};

export {
  useForgotPassword,
};
