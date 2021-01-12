import { AsyncActionType } from '../../data/utils';

export const REGISTER_NEW_USER = new AsyncActionType('REGISTRATION', 'REGISTER_NEW_USER');
export const LOGIN_REQUEST = new AsyncActionType('LOGIN', 'REQUEST');
export const THIRD_PARTY_AUTH_CONTEXT = new AsyncActionType('THIRD_PARTY_AUTH', 'GET_THIRD_PARTY_AUTH_CONTEXT');
export const REGISTER_FORM = new AsyncActionType('REGISTRATION', 'GET_FORM_FIELDS');
export const REGISTER_FORM_VALIDATIONS = new AsyncActionType('REGISTRATION', 'GET_FORM_VALIDATIONS');

// Register

export const registerNewUser = registrationInfo => ({
  type: REGISTER_NEW_USER.BASE,
  payload: { registrationInfo },
});

export const registerNewUserBegin = () => ({
  type: REGISTER_NEW_USER.BEGIN,
});

export const registerNewUserSuccess = (redirectUrl, success) => ({
  type: REGISTER_NEW_USER.SUCCESS,
  payload: { redirectUrl, success },

});

export const registerNewUserFailure = (error) => ({
  type: REGISTER_NEW_USER.FAILURE,
  payload: { error },
});

// Login
export const loginRequest = creds => ({
  type: LOGIN_REQUEST.BASE,
  payload: { creds },
});

export const loginRequestBegin = () => ({
  type: LOGIN_REQUEST.BEGIN,
});

export const loginRequestSuccess = (redirectUrl, success) => ({
  type: LOGIN_REQUEST.SUCCESS,
  payload: { redirectUrl, success },
});

export const loginRequestFailure = (loginError) => ({
  type: LOGIN_REQUEST.FAILURE,
  payload: { loginError },
});

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

// Registration Form Fields
export const fetchRegistrationForm = () => ({
  type: REGISTER_FORM.BASE,
});

export const fetchRegistrationFormBegin = () => ({
  type: REGISTER_FORM.BEGIN,
});

export const fetchRegistrationFormSuccess = (formData) => ({
  type: REGISTER_FORM.SUCCESS,
  payload: { formData },
});

export const fetchRegistrationFormFailure = () => ({
  type: REGISTER_FORM.FAILURE,
});

// Realtime Field validations
export const fetchRealtimeValidations = (formPayload) => ({
  type: REGISTER_FORM_VALIDATIONS.BASE,
  payload: { formPayload },
});

export const fetchRealtimeValidationsBegin = () => ({
  type: REGISTER_FORM_VALIDATIONS.BEGIN,
});

export const fetchRealtimeValidationsSuccess = (validations) => ({
  type: REGISTER_FORM_VALIDATIONS.SUCCESS,
  payload: { validations },
});

export const fetchRealtimeValidationsFailure = (error, statusCode) => ({
  type: REGISTER_FORM_VALIDATIONS.FAILURE,
  payload: { error, statusCode },
});
