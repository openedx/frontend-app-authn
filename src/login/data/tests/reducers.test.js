import reducer from '../reducers';
import {
  LOGIN_PERSIST_FORM_DATA,
} from '../actions';

describe('login reducer', () => {
  it('should set registrationFormData', () => {
    const state = {
      loginFormData: {
        password: '',
        emailOrUsername: '',
        errors: {
          emailOrUsername: '',
          password: '',
        },
      },
    };
    const loginFormData = {
      password: 'johndoe',
      emailOrUsername: 'john@gmail.com',
      errors: {
        emailOrUsername: '',
        password: '',
      },
    };
    const action = {
      type: LOGIN_PERSIST_FORM_DATA,
      payload: { loginFormData },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        loginFormData: {
          password: 'johndoe',
          emailOrUsername: 'john@gmail.com',
          errors: {
            emailOrUsername: '',
            password: '',
          },
        },
      },
    );
  });
});
