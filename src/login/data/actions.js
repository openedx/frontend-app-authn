import { AsyncActionType } from '../../data/utils';

export const LOGIN_REQUEST = new AsyncActionType('LOGIN', 'REQUEST');
export const LOGIN_PERSIST_FORM_DATA = 'LOGIN_PERSIST_FORM_DATA';

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

export const loginRequestReset = () => ({
  type: LOGIN_REQUEST.RESET,
});

export const setLoginFormData = (loginFormData) => ({
  type: LOGIN_PERSIST_FORM_DATA,
  payload: { loginFormData },
});
