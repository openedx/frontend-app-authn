import { AsyncActionType } from '../../data/utils';

export const FORGOT_PASSWORD = new AsyncActionType('FORGOT', 'PASSWORD');
export const FORGOT_PASSWORD_PERSIST_FORM_DATA = 'FORGOT_PASSWORD_PERSIST_FORM_DATA';

// Forgot Password
export const forgotPassword = email => ({
  type: FORGOT_PASSWORD.BASE,
  payload: { email },
});

export const forgotPasswordBegin = () => ({
  type: FORGOT_PASSWORD.BEGIN,
});

export const forgotPasswordSuccess = email => ({
  type: FORGOT_PASSWORD.SUCCESS,
  payload: { email },
});

export const forgotPasswordForbidden = () => ({
  type: FORGOT_PASSWORD.FORBIDDEN,
});

export const forgotPasswordServerError = () => ({
  type: FORGOT_PASSWORD.FAILURE,
});

export const setForgotPasswordFormData = (forgotPasswordFormData) => ({
  type: FORGOT_PASSWORD_PERSIST_FORM_DATA,
  payload: { forgotPasswordFormData },
});
