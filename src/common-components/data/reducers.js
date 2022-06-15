import { THIRD_PARTY_AUTH_CONTEXT } from './actions';

import { PENDING_STATE, COMPLETE_STATE } from '../../data/constants';

export const defaultState = {
  extendedProfile: [],
  fieldDescriptions: {},
  optionalFields: {},
  thirdPartyAuthApiStatus: null,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case THIRD_PARTY_AUTH_CONTEXT.BEGIN:
      return {
        ...state,
        thirdPartyAuthApiStatus: PENDING_STATE,
      };
    case THIRD_PARTY_AUTH_CONTEXT.SUCCESS:
      return {
        ...state,
        extendedProfile: action.payload.fieldDescriptions.extendedProfile,
        fieldDescriptions: action.payload.fieldDescriptions.fields,
        optionalFields: action.payload.optionalFields,
        thirdPartyAuthContext: action.payload.thirdPartyAuthContext,
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      };
    case THIRD_PARTY_AUTH_CONTEXT.FAILURE:
      return {
        ...state,
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      };
    default:
      return state;
  }
};

export default reducer;
