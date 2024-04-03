/**
 * This file contains data for Multi Step Registration Optimizely experiment
 */
import { getConfig } from '@edx/frontend-platform';

import messages from '../../messages';

export const NOT_INITIALIZED = 'experiment-not-initialized';
export const CONTROL = 'control-registration-page';
export const MULTI_STEP_REGISTRATION_EXP_VARIATION = 'multi-step-registration-page';

export const FIRST_STEP = 'first-step';
export const SECOND_STEP = 'second-step';
export const THIRD_STEP = 'third-step';

export const CONTROL_REGISTER_PAGE_FIRST_STEP_FIELDS = ['name', 'email', 'password', 'marketing_email_opt_in', 'ThirdPartyAuth'];
export const CONTROL_REGISTER_PAGE_SECOND_STEP_FIELDS = ['username', 'country'];
export const CONTROL_REGISTER_PAGE_COMMON_FIELDS = ['tos_and_honor_code', 'honor_code'];

export const MULTI_STEP_REGISTER_PAGE_FIRST_STEP_FIELDS = ['email', 'marketing_email_opt_in', 'ThirdPartyAuth'];
export const MULTI_STEP_REGISTER_PAGE_SECOND_STEP_FIELDS = ['name', 'password'];
export const MULTI_STEP_REGISTER_PAGE_THIRD_STEP_FIELDS = ['username', 'country'];
export const MULTI_STEP_REGISTER_PAGE_COMMON_FIELDS = ['tos_and_honor_code', 'honor_code'];

const MULTI_STEP_REGISTRATION_EXP_PAGE = 'authn_register_page';

export function getMultiStepRegistrationExperimentVariation() {
  try {
    if (window.optimizely
        && window.optimizely.get('data').experiments[getConfig().MULTI_STEP_REGISTRATION_EXPERIMENT_ID]) {
      const selectedVariant = window.optimizely.get('state').getVariationMap()[
        getConfig().MULTI_STEP_REGISTRATION_EXPERIMENT_ID
      ];
      return selectedVariant?.name;
    }
  } catch (e) { /* empty */ }
  return '';
}

export function activateMultiStepRegistrationExperiment() {
  window.optimizely = window.optimizely || [];
  window.optimizely.push({
    type: 'page',
    pageName: MULTI_STEP_REGISTRATION_EXP_PAGE,
  });
}

/**
 * We want to display username and honor_code fields in second page if user is in multi-step
 * registration page experiment
 */
export const shouldDisplayFieldInExperiment = (fieldName, expVariation, registerPageStep) => (
  !expVariation || expVariation === NOT_INITIALIZED
  || (expVariation === CONTROL
    && (
      CONTROL_REGISTER_PAGE_COMMON_FIELDS.includes(fieldName)
      || (registerPageStep === FIRST_STEP && CONTROL_REGISTER_PAGE_FIRST_STEP_FIELDS.includes(fieldName))
      || (registerPageStep === SECOND_STEP && CONTROL_REGISTER_PAGE_SECOND_STEP_FIELDS.includes(fieldName))
    ))
  || (expVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION
    && (
      MULTI_STEP_REGISTER_PAGE_COMMON_FIELDS.includes(fieldName)
      || (registerPageStep === FIRST_STEP && MULTI_STEP_REGISTER_PAGE_FIRST_STEP_FIELDS.includes(fieldName))
      || (registerPageStep === SECOND_STEP && MULTI_STEP_REGISTER_PAGE_SECOND_STEP_FIELDS.includes(fieldName))
      || (registerPageStep === THIRD_STEP && MULTI_STEP_REGISTER_PAGE_THIRD_STEP_FIELDS.includes(fieldName))
    ))
);

export const getRegisterButtonLabelInExperiment = (
  existingButtonLabel, expVariation, registerPageStep, formatMessage,
) => {
  if (expVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION && registerPageStep === FIRST_STEP) {
    return formatMessage(messages['multistep.registration.exp.continue.button']);
  }
  return existingButtonLabel;
};

export const getRegisterButtonSubmitStateInExperiment = (
  registerSubmitState, validationsSubmitState, expVariation, registerPageStep,
) => {
  if (expVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION && registerPageStep !== THIRD_STEP) {
    return validationsSubmitState;
  }
  return registerSubmitState;
};

export const getMultiStepRegistrationPreviousStep = (currentStep) => {
  if (currentStep === THIRD_STEP) {
    return SECOND_STEP;
  }
  if (currentStep === SECOND_STEP) {
    return FIRST_STEP;
  }
  return currentStep;
};

export const getMultiStepRegistrationNextStep = (currentStep) => {
  if (currentStep === FIRST_STEP) {
    return SECOND_STEP;
  }
  if (currentStep === SECOND_STEP) {
    return THIRD_STEP;
  }
  return currentStep;
};
