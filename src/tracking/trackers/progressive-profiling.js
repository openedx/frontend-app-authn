import { createEventTracker, createLinkTracker, createPageEventTracker } from '../../data/segment/utils';

export const eventNames = {
  progressiveProfilingSubmitClick: 'edx.bi.welcome.page.submit.clicked',
  progressiveProfilingSkipLinkClick: 'edx.bi.welcome.page.skip.link.clicked',
  disablePostRegistrationRecommendations: 'edx.bi.user.recommendations.not.enabled',
  progressiveProfilingSupportLinkCLick: 'edx.bi.welcome.page.support.link.clicked',
  loginAndRegistration: 'login_and_registration',
};

// Event link tracker for Progressive profiling skip button click
export const trackProgressiveProfilingSkipLinkClick = (evenProperties) => createEventTracker(
  eventNames.progressiveProfilingSkipLinkClick, { ...evenProperties },
);

// Event tracker for progressive profiling submit button click
export const trackProgressiveProfilingSubmitClick = (evenProperties) => createEventTracker(
  eventNames.progressiveProfilingSubmitClick,
  { ...evenProperties },
)();

// Event tracker for progressive profiling submit button click
export const trackDisablePostRegistrationRecommendations = (evenProperties) => createEventTracker(
  eventNames.disablePostRegistrationRecommendations,
  { ...evenProperties },
)();

// Tracks the progressive profiling page event.
export const trackProgressiveProfilingPageViewed = () => {
  createPageEventTracker(eventNames.loginAndRegistration, 'welcome')();
};

// Tracks the progressive profiling spport link click.
export const trackProgressiveProfilingSupportLinkCLick = () => createEventTracker(
  eventNames.progressiveProfilingSupportLinkCLick,
  {},
)();
