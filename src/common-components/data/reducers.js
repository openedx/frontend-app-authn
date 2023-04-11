import { COMPLETE_STATE, PENDING_STATE } from '../../data/constants';
import { THIRD_PARTY_AUTH_CONTEXT, THIRD_PARTY_AUTH_CONTEXT_CLEAR_ERROR_MSG } from './actions';

export const defaultState = {
  fieldDescriptions: {},
  optionalFields: {},
  thirdPartyAuthApiStatus: null,
  thirdPartyAuthContext: {
    currentProvider: null,
    finishAuthUrl: null,
    countryCode: null,
    providers: [],
    secondaryProviders: [],
    pipelineUserDetails: null,
    errorMessage: null,
  },
};

const reducer = (state = defaultState, action = {}) => {
  switch (action.type) {
    case THIRD_PARTY_AUTH_CONTEXT.BEGIN:
      return {
        ...state,
        thirdPartyAuthApiStatus: PENDING_STATE,
      };
    case THIRD_PARTY_AUTH_CONTEXT.SUCCESS: {
      return {
        ...state,
        fieldDescriptions: action.payload.fieldDescriptions.fields,
        optionalFields: action.payload.optionalFields,
        thirdPartyAuthContext: action.payload.thirdPartyAuthContext,
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      };
    }
    case THIRD_PARTY_AUTH_CONTEXT.FAILURE:
      return {
        ...state,
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      };
    case THIRD_PARTY_AUTH_CONTEXT_CLEAR_ERROR_MSG:
      return {
        ...state,
        thirdPartyAuthApiStatus: PENDING_STATE,
        thirdPartyAuthContext: {
          ...state.thirdPartyAuthContext,
          errorMessage: null,
        },
      };
    default:
      return state;
  }
};

export default reducer;
