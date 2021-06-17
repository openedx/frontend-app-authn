import { createSelector } from 'reselect';

export const storeName = 'commonComponents';

export const commonComponentsSelector = state => ({ ...state[storeName] });

export const thirdPartyAuthContextSelector = createSelector(
  commonComponentsSelector,
  commonComponents => commonComponents.thirdPartyAuthContext,
);
