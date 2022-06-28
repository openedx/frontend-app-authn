import { createSelector } from 'reselect';

import { FORM_FIELDS } from './constants';

export const storeName = 'register';

export const registerSelector = state => ({ ...state[storeName] });

export const registrationRequestSelector = createSelector(
  registerSelector,
  register => register.registrationResult,
);

export const registrationErrorSelector = createSelector(
  registerSelector,
  register => register.registrationError.errorCode,
);

export const validationsSelector = createSelector(
  registerSelector,
  (register) => {
    const { registrationError, validations } = register;

    if (validations) {
      return validations.validationDecisions;
    }

    if (Object.keys(registrationError).length > 0) {
      const validationDecisions = {};
      FORM_FIELDS.forEach(field => {
        validationDecisions[field] = registrationError[field] ? registrationError[field][0].userMessage : '';
      });

      return validationDecisions;
    }

    return null;
  },
);

export const usernameSuggestionsSelector = createSelector(
  registerSelector,
  register => register.usernameSuggestions,
);

export const registrationFormDataSelector = createSelector(
  registerSelector,
  register => register.registrationFormData,
);
