import { createSelector } from 'reselect';

export const storeName = 'commonComponents';

export const commonComponentsSelector = state => ({ ...state[storeName] });

export const welcomePageContextSelector = createSelector(
  commonComponentsSelector,
  commonComponents => ({
    fields: commonComponents.optionalFields.fields,
    extended_profile: commonComponents.optionalFields.extended_profile,
    nextUrl: commonComponents.thirdPartyAuthContext.welcomePageRedirectUrl,
  }),
);
