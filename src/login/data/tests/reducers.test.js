import { getConfig } from '@edx/frontend-platform';

import { DEFAULT_REDIRECT_URL, DEFAULT_STATE } from '../../../data/constants';
import { RESET_PASSWORD } from '../../../reset-password';
import { DISMISS_PASSWORD_RESET_BANNER, LOGIN_REQUEST } from '../actions';
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
});
