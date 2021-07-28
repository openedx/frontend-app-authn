import { createSelector } from 'reselect';

export const storeName = 'resetPassword';

export const resetPasswordSelector = state => ({ ...state[storeName] });

export const resetPasswordResultSelector = createSelector(
  resetPasswordSelector,
  resetPassword => resetPassword,
);
