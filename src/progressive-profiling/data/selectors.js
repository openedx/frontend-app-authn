import { createSelector } from 'reselect';

export const storeName = 'commonComponents';

export const commonComponentsSelector = state => ({ ...state[storeName] });

export const welcomePageContextSelector = createSelector(
  commonComponentsSelector,
  commonComponents => ({
    fields: commonComponents.optionalFields.fields,
    extendedProfile: commonComponents.optionalFields.extendedProfile,
    nextUrl: commonComponents.thirdPartyAuthContext.welcomePageRedirectUrl,
  }),
);
