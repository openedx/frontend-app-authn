import { getConfig } from '@edx/frontend-platform';

import { DEFAULT_REDIRECT_URL, DEFAULT_STATE, PENDING_STATE } from '../../../data/constants';
import { RESET_PASSWORD } from '../../../reset-password';
import { BACKUP_LOGIN_DATA, DISMISS_PASSWORD_RESET_BANNER, LOGIN_REQUEST } from '../actions';
import reducer from '../reducers';

describe('login reducer', () => {
  const defaultState = {
    loginErrorCode: '',
    loginErrorContext: {},
    loginResult: {},
    loginFormData: {
      formFields: {
        emailOrUsername: '', password: '',
      },
      errors: {
        emailOrUsername: '', password: '',
      },
    },
    shouldBackupState: false,
    showResetPasswordSuccessBanner: false,
    submitState: DEFAULT_STATE,
  };

  it('should update state to show reset password success banner', () => {
    const action = {
      type: RESET_PASSWORD.SUCCESS,
    };

    expect(
      reducer(defaultState, action),
    ).toEqual(
      {
        ...defaultState,
        showResetPasswordSuccessBanner: true,
      },
    );
  });

  it('should set the flag which keeps the login form data in redux state', () => {
    const action = {
      type: BACKUP_LOGIN_DATA.BASE,
    };

    expect(
      reducer(defaultState, action),
    ).toEqual(
      {
        ...defaultState,
        shouldBackupState: true,
      },
    );
  });

  it('should backup the login form data', () => {
    const payload = {
      formFields: {
        emailOrUsername: 'test@exmaple.com',
        password: 'test1',
      },
      errors: {
        emailOrUsername: '', password: '',
      },
    };
    const action = {
      type: BACKUP_LOGIN_DATA.BEGIN,
      payload,
    };

    expect(
      reducer(defaultState, action),
    ).toEqual(
      {
        ...defaultState,
        loginFormData: payload,
      },
    );
  });

  it('should update state to dismiss reset password banner', () => {
    const action = {
      type: DISMISS_PASSWORD_RESET_BANNER,
    };

    expect(
      reducer(defaultState, action),
    ).toEqual(
      {
        ...defaultState,
        showResetPasswordSuccessBanner: false,
      },
    );
  });

  it('should start the login request', () => {
    const action = {
      type: LOGIN_REQUEST.BEGIN,
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        showResetPasswordSuccessBanner: false,
        submitState: PENDING_STATE,
      },
    );
  });

  it('should set redirect url on login success action', () => {
    const payload = {
      redirectUrl: `${getConfig().BASE_URL}${DEFAULT_REDIRECT_URL}`,
      success: true,
    };
    const action = {
      type: LOGIN_REQUEST.SUCCESS,
      payload,
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        loginResult: payload,
      },
    );
  });

  it('should set the error data on login request failure', () => {
    const payload = {
      loginError: {
        success: false,
        value: 'Email or password is incorrect.',
        errorCode: 'incorrect-email-or-password',
        context: {
          failureCount: 0,
        },
      },
      email: 'test@example.com',
      redirectUrl: '',
    };
    const action = {
      type: LOGIN_REQUEST.FAILURE,
      payload,
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        loginErrorCode: payload.loginError.errorCode,
        loginErrorContext: { ...payload.loginError.context, email: payload.email, redirectUrl: payload.redirectUrl },
        submitState: DEFAULT_STATE,
      },
    );
  });
});
