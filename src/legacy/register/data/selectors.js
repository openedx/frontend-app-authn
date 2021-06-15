import { createSelector } from 'reselect';

export const storeName = 'register';

export const registerSelector = state => ({ ...state[storeName] });

export const registrationRequestSelector = createSelector(
  registerSelector,
  register => register.registrationResult,
);
