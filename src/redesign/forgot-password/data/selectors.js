import { createSelector } from 'reselect';

export const storeName = 'forgotPassword';

export const forgotPasswordSelector = state => ({ ...state[storeName] });

export const forgotPasswordResultSelector = createSelector(
  forgotPasswordSelector,
  forgotPassword => forgotPassword,
);
