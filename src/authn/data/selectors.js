import { createSelector } from 'reselect';

export const storeName = 'authn';

export const authnSelector = state => ({ ...state[storeName] });

export const loginRequestSelector = createSelector(
  authnSelector,
  authn => authn.loginResult,
);

export const loginErrorSelector = createSelector(
  authnSelector,
  authn => authn.loginError,
);

export const registrationRequestSelector = createSelector(
  authnSelector,
  authn => authn.registrationResult,
);

export const thirdPartyAuthContextSelector = createSelector(
  authnSelector,
  authn => authn.thirdPartyAuthContext,
);
