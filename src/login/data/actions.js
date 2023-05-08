import { AsyncActionType } from '../../data/utils';

export const BACKUP_LOGIN_DATA = new AsyncActionType('LOGIN', 'BACKUP_LOGIN_DATA');
export const LOGIN_REQUEST = new AsyncActionType('LOGIN', 'REQUEST');
export const DISMISS_PASSWORD_RESET_BANNER = 'DISMISS_PASSWORD_RESET_BANNER';

// Backup login form data
export const backupLoginForm = () => ({
  type: BACKUP_LOGIN_DATA.BASE,
});

export const backupLoginFormBegin = (data) => ({
  type: BACKUP_LOGIN_DATA.BEGIN,
  payload: { ...data },
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

export const dismissPasswordResetBanner = () => ({
  type: DISMISS_PASSWORD_RESET_BANNER,
});
