import { createSelector } from 'reselect';

export const storeName = 'login';

export const loginSelector = state => ({ ...state[storeName] });

export const loginRequestSelector = createSelector(
  loginSelector,
  login => login.loginResult,
);

export const loginErrorSelector = createSelector(
  loginSelector,
  login => login.loginError,
);

export const loginFormDataSelector = createSelector(
  loginSelector,
  login => login.loginFormData,
);
