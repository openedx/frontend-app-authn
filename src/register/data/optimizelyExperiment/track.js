import { sendTrackEvent } from '@edx/frontend-platform/analytics';

export const eventNames = {
  multiStepRegistrationStep1Viewed: 'edx.bi.user.multistepregistration.step1.viewed',
  multiStepRegistrationStep2Viewed: 'edx.bi.user.multistepregistration.step2.viewed',
  multiStepRegistrationStep3Viewed: 'edx.bi.user.multistepregistration.step3.viewed',
  multiStepRegistrationStep1SubmitBtnClicked: 'edx.bi.user.registration.step1.submit.click',
  multiStepRegistrationStep2SubmitBtnClicked: 'edx.bi.user.registration.step2.submit.click',
  multiStepRegistrationStep3SubmitBtnClicked: 'edx.bi.user.registration.step3.submit.click',
  multiStepRegistrationFormSubmitBtnClicked: 'edx.bi.user.registration.form.submit.click',
  multiStepRegistrationSSOBtnClicked: 'edx.bi.user.registration.sso.btn.click',
};

export const trackMultiStepRegistrationStep1Viewed = (expVariation) => {
  sendTrackEvent(eventNames.multiStepRegistrationStep1Viewed, {
    variation: expVariation,
  });
};

export const trackMultiStepRegistrationStep2Viewed = (expVariation) => {
  sendTrackEvent(eventNames.multiStepRegistrationStep2Viewed, {
    variation: expVariation,
  });
};

export const trackMultiStepRegistrationStep3Viewed = () => {
  sendTrackEvent(eventNames.multiStepRegistrationStep3Viewed, {});
};

export const trackMultiStepRegistrationStep1SubmitBtnClicked = (expVariation) => {
  sendTrackEvent(eventNames.multiStepRegistrationStep1SubmitBtnClicked, {
    variation: expVariation,
  });
};

export const trackMultiStepRegistrationStep2SubmitBtnClicked = (expVariation) => {
  sendTrackEvent(eventNames.multiStepRegistrationStep2SubmitBtnClicked, {
    variation: expVariation,
  });
};

export const trackMultiStepRegistrationStep3SubmitBtnClicked = () => {
  sendTrackEvent(eventNames.multiStepRegistrationStep3SubmitBtnClicked, {});
};

export const trackMultiStepRegistrationFormSubmitBtnClicked = (expVariation) => {
  sendTrackEvent(eventNames.multiStepRegistrationFormSubmitBtnClicked, {
    variation: expVariation,
  });
};

export const trackMultiStepRegistrationSSOBtnClicked = (expVariation) => {
  sendTrackEvent(eventNames.multiStepRegistrationSSOBtnClicked, {
    variation: expVariation,
  });
};
