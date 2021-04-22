import { createSelector } from 'reselect';

export const storeName = 'register';

export const registerSelector = state => ({ ...state[storeName] });

export const registrationRequestSelector = createSelector(
  registerSelector,
  register => register.registrationResult,
);

export const registrationErrorSelector = createSelector(
  registerSelector,
  register => register.registrationError,
);

export const validationsSelector = createSelector(
  registerSelector,
  register => register.validations,
);

export const usernameSuggestionsSelector = createSelector(
  validationsSelector,
  registrationErrorSelector,
  (validations, registrationResult) => {
    let usernameSuggestions = validations && validations.username_suggestions ? validations.username_suggestions : [];
    if (usernameSuggestions.length === 0) {
      usernameSuggestions = (
        registrationResult && registrationResult.username_suggestions ? registrationResult.username_suggestions : []
      );
    }

    return usernameSuggestions;
  },
);
