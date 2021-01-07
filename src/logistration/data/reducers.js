import {
  REGISTER_NEW_USER,
  LOGIN_REQUEST,
  THIRD_PARTY_AUTH_CONTEXT,
  REGISTER_FORM,
  REGISTER_FORM_VALIDATIONS,
} from './actions';

import { DEFAULT_STATE, PENDING_STATE, COMPLETE_STATE } from '../../data/constants';

export const defaultState = {
  loginError: null,
  loginResult: {},
  registrationError: null,
  registrationResult: {},
  formData: null,
  validations: null,
  statusCode: null,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case REGISTER_NEW_USER.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
      };
    case REGISTER_NEW_USER.SUCCESS:
      return {
        ...state,
        registrationResult: action.payload,
      };
    case REGISTER_NEW_USER.FAILURE:
      return {
        ...state,
        registrationError: action.payload.error,
        submitState: DEFAULT_STATE,
      };
    case LOGIN_REQUEST.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
      };
    case LOGIN_REQUEST.SUCCESS:
      return {
        ...state,
        loginResult: action.payload,
      };
    case LOGIN_REQUEST.FAILURE:
      return {
        ...state,
        loginError: action.payload.loginError,
        submitState: DEFAULT_STATE,
      };
    case THIRD_PARTY_AUTH_CONTEXT.BEGIN:
      return {
        ...state,
        thirdPartyAuthApiStatus: PENDING_STATE,
      };
    case THIRD_PARTY_AUTH_CONTEXT.SUCCESS:
      return {
        ...state,
        thirdPartyAuthContext: action.payload.thirdPartyAuthContext,
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      };
    case THIRD_PARTY_AUTH_CONTEXT.FAILURE:
      return {
        ...state,
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      };
    case REGISTER_FORM.BEGIN:
      return {
        ...state,
      };
    case REGISTER_FORM.SUCCESS:
      return {
        ...state,
        formData: action.payload.formData,
      };
    case REGISTER_FORM.FAILURE:
      return {
        ...state,
      };
    case REGISTER_FORM_VALIDATIONS.BEGIN:
      return {
        ...state,
      };
    case REGISTER_FORM_VALIDATIONS.SUCCESS:
      return {
        ...state,
        validations: action.payload.validations,
      };
    case REGISTER_FORM_VALIDATIONS.FAILURE:
      return {
        ...state,
        validations: action.payload.error,
        statusCode: action.payload.statusCode,
      };
    default:
      return state;
  }
};

export default reducer;
