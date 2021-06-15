import { AsyncActionType } from '../../data/utils';

export const THIRD_PARTY_AUTH_CONTEXT = new AsyncActionType('THIRD_PARTY_AUTH', 'GET_THIRD_PARTY_AUTH_CONTEXT');

// Third party auth context
export const getThirdPartyAuthContext = (urlParams) => ({
  type: THIRD_PARTY_AUTH_CONTEXT.BASE,
  payload: { urlParams },
});

export const getThirdPartyAuthContextBegin = () => ({
  type: THIRD_PARTY_AUTH_CONTEXT.BEGIN,
});

export const getThirdPartyAuthContextSuccess = (thirdPartyAuthContext) => ({
  type: THIRD_PARTY_AUTH_CONTEXT.SUCCESS,
  payload: { thirdPartyAuthContext },
});

export const getThirdPartyAuthContextFailure = () => ({
  type: THIRD_PARTY_AUTH_CONTEXT.FAILURE,
});
