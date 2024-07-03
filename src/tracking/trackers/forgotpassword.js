import { createEventTracker, createPageEventTracker } from '../../data/segment/utils';

export const eventNames = {
  loginAndRegistration: 'login_and_registration',
  forgotPasswordPageViewed: 'edx.bi.password_reset_form.viewed',
};

export const categories = {
  userEngagement: 'user-engagement',
};

// Event tracker for forgot password page viewed
export const trackForgotPasswordPageViewed = () => createEventTracker(
  eventNames.forgotPasswordPageViewed,
  {
    category: categories.userEngagement,
  },
)();

export const trackForgotPasswordPageEvent = () => {
  createPageEventTracker(eventNames.loginAndRegistration, 'forgot-password')();
};
