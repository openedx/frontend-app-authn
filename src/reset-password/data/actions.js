import { AsyncActionType } from '../../data/utils';

export const RESET_PASSWORD = new AsyncActionType('RESET', 'PASSWORD');
export const VALIDATE_TOKEN = new AsyncActionType('VALIDATE', 'TOKEN');
export const PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE';

export const passwordResetFailure = (errorCode) => ({
  type: PASSWORD_RESET_FAILURE,
  payload: { errorCode },
});

// Validate confirmation token
export const validateToken = (token) => ({
  type: VALIDATE_TOKEN.BASE,
  payload: { token },
});

export const validateTokenBegin = () => ({
  type: VALIDATE_TOKEN.BEGIN,
});

export const validateTokenSuccess = (tokenStatus, token) => ({
  type: VALIDATE_TOKEN.SUCCESS,
  payload: { tokenStatus, token },
});

export const validateTokenFailure = errorCode => ({
  type: VALIDATE_TOKEN.FAILURE,
  payload: { errorCode },
});

// Reset Password
export const resetPassword = (formPayload, token, params) => ({
  type: RESET_PASSWORD.BASE,
  payload: { formPayload, token, params },
});

export const resetPasswordBegin = () => ({
  type: RESET_PASSWORD.BEGIN,
});

export const resetPasswordSuccess = data => ({
  type: RESET_PASSWORD.SUCCESS,
  payload: { data },
});

export const resetPasswordFailure = (errorCode, errorMsg = null) => ({
  type: RESET_PASSWORD.FAILURE,
  payload: { errorCode, errorMsg: errorMsg || errorCode },
});
