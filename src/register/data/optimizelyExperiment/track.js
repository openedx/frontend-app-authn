import { sendTrackEvent } from '@edx/frontend-platform/analytics';

export const eventNames = {
  simplifyRegistrationFirstStepViewed: 'edx.bi.user.simplifyregistration.step1.viewed',
  simplifyRegistrationSecondStepViewed: 'edx.bi.user.simplifyregistration.step2.viewed',
  simplifyRegistrationContinueBtnClicked: 'edx.bi.user.registration.submit.click',
  simplifyRegistrationValidatedSubmitBtnClicked: 'edx.bi.user.registration.validated.submit.click',
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

export const trackSimplifyRegistrationValidatedSubmitBtnClicked = (expVariation) => {
  sendTrackEvent(eventNames.simplifyRegistrationValidatedSubmitBtnClicked, {
    variation: expVariation,
  });
};
