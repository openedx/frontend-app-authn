import { createEventTracker, createPageEventTracker } from '../../data/segment/utils';

export const eventNames = {
  loginAndRegistration: 'login_and_registration',
  registrationSuccess: 'edx.bi.user.account.registered.client',
  loginFormToggled: 'edx.bi.login_form.toggled',
};

export const categories = {
  userEngagement: 'user-engagement',
};

// Event tracker for successful registration
export const trackRegistrationSuccess = () => createEventTracker(
  eventNames.registrationSuccess,
  {},
)();

// Tracks the progressive profiling page event.
export const trackRegistrationPageViewed = () => {
  createPageEventTracker(eventNames.loginAndRegistration, 'register')();
};

// Tracks the progressive profiling page event.
export const trackLoginFormToggled = () => {
  createEventTracker(
    eventNames.loginFormToggled,
    { category: categories.userEngagement },
  )();
};
