import { createEventTracker, createLinkTracker, createPageEventTracker } from '../../data/segment/utils';

export const eventNames = {
  progressiveProfilingSubmitClick: 'edx.bi.welcome.page.submit.clicked',
  progressiveProfilingSkipLinkClick: 'edx.bi.welcome.page.skip.link.clicked',
  loginAndRegistration: 'login_and_registration',
};

// Event link tracker for Progressive profiling skip button click
export const trackProgressiveProfilingSkipLinkClick = (redirectUrl) => createLinkTracker(
  createEventTracker(eventNames.progressiveProfilingSkipLinkClick, {}),
  redirectUrl,
);

// Event tracker for progressive profiling submit button click
export const trackProgressiveProfilingSubmitClick = (evenProperties) => createEventTracker(
  eventNames.progressiveProfilingSubmitClick,
  { ...evenProperties },
)();

// Tracks the progressive profiling page event.
export const trackProgressiveProfilingPageViewed = () => {
  createPageEventTracker(eventNames.loginAndRegistration, 'welcome')();
};
