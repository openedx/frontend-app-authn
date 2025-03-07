import {
  FORGOT_PASSWORD_PERSIST_FORM_DATA,
} from '../actions';
import reducer from '../reducers';

describe('forgot password reducer', () => {
  it('should set email and emailValidationError', () => {
    const state = {
      status: '',
      submitState: '',
      email: '',
      emailValidationError: '',
    };
    const forgotPasswordFormData = {
      email: 'test@gmail',
      emailValidationError: 'Enter a valid email address',
    };
    const action = {
      type: FORGOT_PASSWORD_PERSIST_FORM_DATA,
      payload: { forgotPasswordFormData },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        status: '',
        submitState: '',
        email: 'test@gmail',
        emailValidationError: 'Enter a valid email address',
      },
    );
  });
});
