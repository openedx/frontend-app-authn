import { createSelector } from 'reselect';

export const storeName = 'register';

export const registerSelector = state => ({ ...state[storeName] });

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
      const fields = Object.keys(registrationError).filter((fieldName) => !(fieldName in ['errorCode', 'usernameSuggestions']));

      const validationDecisions = {};
      fields.forEach(field => {
        validationDecisions[field] = registrationError[field][0].userMessage || '';
      });
      return validationDecisions;
    }

    return null;
  },
);
