import { AsyncActionType } from '../../data/utils';

export const THIRD_PARTY_AUTH_CONTEXT = new AsyncActionType('THIRD_PARTY_AUTH', 'GET_THIRD_PARTY_AUTH_CONTEXT');
export const THIRD_PARTY_AUTH_CONTEXT_CLEAR_ERROR_MSG = 'THIRD_PARTY_AUTH_CONTEXT_CLEAR_ERROR_MSG';

// Third party auth context
export const getThirdPartyAuthContext = (urlParams) => ({
  type: THIRD_PARTY_AUTH_CONTEXT.BASE,
  payload: { urlParams },
});

export const getThirdPartyAuthContextBegin = () => ({
  type: THIRD_PARTY_AUTH_CONTEXT.BEGIN,
});

export const getThirdPartyAuthContextSuccess = (fieldDescriptions, optionalFields, thirdPartyAuthContext) => ({
  type: THIRD_PARTY_AUTH_CONTEXT.SUCCESS,
  payload: { fieldDescriptions, optionalFields, thirdPartyAuthContext },
});

export const getThirdPartyAuthContextFailure = () => ({
  type: THIRD_PARTY_AUTH_CONTEXT.FAILURE,
});

export const clearThirdPartyAuthContextErrorMessage = () => ({
  type: THIRD_PARTY_AUTH_CONTEXT_CLEAR_ERROR_MSG,
});
