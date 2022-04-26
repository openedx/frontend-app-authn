import { createSelector } from 'reselect';

export const storeName = 'commonComponents';

export const commonComponentsSelector = state => ({ ...state[storeName] });

export const thirdPartyAuthContextSelector = createSelector(
  commonComponentsSelector,
  commonComponents => commonComponents.thirdPartyAuthContext,
);

export const fieldDescriptionSelector = createSelector(
  commonComponentsSelector,
  commonComponents => commonComponents.fieldDescriptions,
);

export const extendedProfileSelector = createSelector(
  commonComponentsSelector,
  commonComponents => commonComponents.extendedProfile,
);
