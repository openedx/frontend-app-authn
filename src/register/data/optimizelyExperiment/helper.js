/**
 * This file contains data for simplified Registration Optimizely experiment
 */
import { getConfig, snakeCaseObject } from '@edx/frontend-platform';

import messages from '../../messages';

export const DEFAULT_VARIATION = 'default-register-page';
export const SIMPLIFIED_REGISTRATION_VARIATION = 'simplified-register-page';

export const FIRST_STEP = 'first-step';
export const SECOND_STEP = 'second-step';

export const SIMPLIFIED_REGISTER_PAGE_SECOND_STEP_FIELDS = ['username', 'tos_and_honor_code', 'honor_code'];

const SIMPLIFY_REGISTRATION_EXP_PAGE = 'authn_register_page';

export function getSimplifyRegistrationExperimentVariation() {
  try {
    if (window.optimizely && window.optimizely.get('data').experiments[getConfig().SIMPLIFY_REGISTRATION_EXPERIMENT_ID]) {
      const selectedVariant = window.optimizely.get('state').getVariationMap()[
        getConfig().SIMPLIFY_REGISTRATION_EXPERIMENT_ID
      ];
      return selectedVariant?.name;
    }
  } catch (e) { /* empty */ }
  return '';
}

export function activateSimplifyRegistrationExperiment() {
  window.optimizely = window.optimizely || [];
  window.optimizely.push({
    type: 'page',
    pageName: SIMPLIFY_REGISTRATION_EXP_PAGE,
  });
}

/**
 * We want to display username and honor_code fields in second page if user is in simplified
 * registration page experiment
 */
export const shouldDisplayFieldInExperiment = (fieldName, expVariation, registerPageStep) => (
  !expVariation || expVariation === DEFAULT_VARIATION || (expVariation === SIMPLIFIED_REGISTRATION_VARIATION
    && (
      (registerPageStep === FIRST_STEP && fieldName !== 'username')
      || (registerPageStep === SECOND_STEP && SIMPLIFIED_REGISTER_PAGE_SECOND_STEP_FIELDS.includes(fieldName))
    ))
);

export const getRegisterButtonLabelInExperiment = (
  existingButtonLabel, expVariation, registerPageStep, formatMessage,
) => {
  if (expVariation === SIMPLIFIED_REGISTRATION_VARIATION && registerPageStep === FIRST_STEP) {
    return formatMessage(messages['simplified.registration.exp.button']);
  }
  return existingButtonLabel;
};

export const prepareSimplifiedRegistrationFirstStepPayload = (
  initPayload,
  configurableFormFields,
) => {
  let payload = { ...initPayload };

  // Removing username field that is in second step of registration form
  delete payload.username;

  Object.keys(configurableFormFields).forEach((fieldName) => {
    if (fieldName === 'country') {
      payload[fieldName] = configurableFormFields[fieldName].countryCode;
    } else {
      payload[fieldName] = configurableFormFields[fieldName];
    }
  });

  payload = snakeCaseObject(payload);

  payload = { ...payload };
  return payload;
};
