import { sendTrackEvent } from '@edx/frontend-platform/analytics';

export const eventNames = {
  simplifyRegistrationFirstStepViewed: 'edx.bi.user.simplifyregistration.step1.viewed',
  simplifyRegistrationSecondStepViewed: 'edx.bi.user.simplifyregistration.step2.viewed',
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

export const trackSimplifyRegistrationContinueBtnClicked = (expVariation) => {
  sendTrackEvent(eventNames.simplifyRegistrationContinueBtnClicked, {
    variation: expVariation,
  });
};
