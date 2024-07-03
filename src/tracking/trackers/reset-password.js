import { createEventTracker, createPageEventTracker } from '../../data/segment/utils';

export const eventNames = {
  loginAndRegistration: 'login_and_registration',
  resetPasswordSuccess: 'edx.bi.user.password.reset.success',
};

export const trackResetPasswordPageViewed = () => {
  createPageEventTracker(eventNames.loginAndRegistration, 'reset-password')();
};

export const trackPasswordResetSuccess = () => {
  createEventTracker(eventNames.resetPasswordSuccess, {})();
};
