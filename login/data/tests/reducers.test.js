import {
  LOGIN_PERSIST_FORM_DATA, LOGIN_REMOVE_PASSWORD_RESET_BANNER,
} from '../actions';
import reducer from '../reducers';

describe('login reducer', () => {
  it('should set loginFormData', () => {
    const state = {
      loginFormData: {
        password: '',
        emailOrUsername: '',
        errors: {
          emailOrUsername: '',
          password: '',
        },
      },
      resetPassword: false,
    };
    const formData = {
      password: 'johndoe',
      emailOrUsername: 'john@gmail.com',
    };
    const action = {
      type: LOGIN_PERSIST_FORM_DATA,
      payload: { formData },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        loginFormData: {
          ...state.loginFormData,
          password: 'johndoe',
          emailOrUsername: 'john@gmail.com',
        },
        resetPassword: false,
      },
    );
  });

  it('should set resetPassword', () => {
    const state = {
      resetPassword: true,
    };
    const action = {
      type: LOGIN_REMOVE_PASSWORD_RESET_BANNER,
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        resetPassword: false,
      },
    );
  });
});
