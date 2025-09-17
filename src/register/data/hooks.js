import { useCallback } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const useRecaptchaSubmission = (actionName = 'submit') => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const recaptchaKey = getConfig().RECAPTCHA_SITE_KEY_WEB;

  const isReady = !!executeRecaptcha || !recaptchaKey;

  const executeWithFallback = useCallback(async () => {
    if (executeRecaptcha && recaptchaKey) {
      const token = await executeRecaptcha(actionName);
      if (!token) {
        throw new Error('reCAPTCHA verification failed. Please try again.');
      }
      return token;
    }

    // Fallback: no reCAPTCHA or not ready
    if (recaptchaKey) {
      // eslint-disable-next-line no-console
      console.warn(`reCAPTCHA not ready for action: ${actionName}. Proceeding without token.`);
    }
    return null;
  }, [executeRecaptcha, recaptchaKey, actionName]);

  return {
    executeWithFallback,
    isReady,
    isLoading: recaptchaKey && !executeRecaptcha,
  };
};

export default useRecaptchaSubmission;
