import { createSelector } from 'reselect';

export const storeName = 'logistration';

export const logistrationSelector = state => ({ ...state[storeName] });

export const loginRequestSelector = createSelector(
  logistrationSelector,
  logistration => logistration.loginResult,
);

export const loginErrorSelector = createSelector(
  logistrationSelector,
  logistration => logistration.loginError,
);

export const registrationRequestSelector = createSelector(
  logistrationSelector,
  logistration => logistration.registrationResult,
);

export const thirdPartyAuthContextSelector = createSelector(
  logistrationSelector,
  logistration => logistration.thirdPartyAuthContext,
);
