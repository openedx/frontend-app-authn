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

export const optionalFieldsSelector = createSelector(
  commonComponentsSelector,
  commonComponents => commonComponents.optionalFields,
);

export const tpaProvidersSelector = createSelector(
  commonComponentsSelector,
  commonComponents => ({
    providers: commonComponents.thirdPartyAuthContext.providers,
    secondaryProviders: commonComponents.thirdPartyAuthContext.secondaryProviders,
  }),
);
