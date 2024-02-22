import { sendTrackEvent } from '@edx/frontend-platform/analytics';

export const eventNames = {
  /**
   * sso button clicked
   */
  simplifyRegistrationFirstStepViewed: 'edx.bi.user.simplifyregistration.step1.viewed', // page = first/second, variation,
  simplifyRegistrationSecondStepViewed: 'edx.bi.user.simplifyregistration.step2.viewed', // page = first/second, variation,
  simplifyRegistrationContinueBtnClicked: 'edx.bi.user.registration.submit.click',
};

export const trackSimplifyRegistrationFirstStepViewed = (expVariation) => {
  sendTrackEvent(
    eventNames.simplifyRegistrationFirstStepViewed, {
      variation: expVariation,
    },
  );
};

export const trackSimplifyRegistrationSecondStepViewed = () => {
  sendTrackEvent(eventNames.simplifyRegistrationSecondStepViewed, {});
};

export const trackSimplifyRegistrationContinueBtnClicked = () => {
  sendTrackEvent(eventNames.simplifyRegistrationContinueBtnClicked, {});
};
