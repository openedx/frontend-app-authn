import reducer from '../reducers';
import {
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  REGISTER_SET_FORM_DATA,
  REGISTRATION_FORM,
} from '../actions';
import { DEFAULT_STATE } from '../../../data/constants';

describe('register reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        registrationError: {},
        registrationResult: {},
        formData: {
          country: '',
          email: '',
          name: '',
          password: '',
          username: '',
          marketingOptIn: true,
          errors: {
            email: '',
            name: '',
            username: '',
            password: '',
            country: '',
          },
          emailErrorSuggestion: null,
          emailWarningSuggestion: null,
        },
        validations: null,
        statusCode: null,
        usernameSuggestions: [],
      },
    );
  });

  it('should set username suggestions upon validation failed case', () => {
    const state = { usernameSuggestions: [] };
    const validations = { usernameSuggestions: ['test12'] };
    const action = {
      type: REGISTER_FORM_VALIDATIONS.SUCCESS,
      payload: { validations },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        validations,
        usernameSuggestions: validations.usernameSuggestions,
      },
    );
  });

  it('should set username suggestions upon registration error case', () => {
    const state = { usernameSuggestions: [] };
    const payload = { usernameSuggestions: ['test12'] };
    const action = {
      type: REGISTER_NEW_USER.FAILURE,
      payload,
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        registrationError: payload,
        submitState: DEFAULT_STATE,
        usernameSuggestions: payload.usernameSuggestions,
        validations: null,
      },
    );
  });

  it('should clear username suggestions from validations state', () => {
    const state = {
      usernameSuggestions: ['test_1'],
    };
    const action = {
      type: REGISTER_CLEAR_USERNAME_SUGGESTIONS,
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        usernameSuggestions: [],
      },
    );
  });
  it('should not reset username suggestions and form data in form reset', () => {
    const state = {
      registrationError: {},
      registrationResult: {},
      formData: {
        country: 'Pakistan',
        email: 'test@email.com',
        name: 'John Doe',
        password: 'johndoe',
        username: 'john',
        marketingOptIn: true,
        errors: {
          email: '',
          name: '',
          username: '',
          password: '',
          country: '',
        },
        emailErrorSuggestion: 'test@email.com',
        emailWarningSuggestion: 'test@email.com',
      },
      validations: null,
      statusCode: null,
      usernameSuggestions: [],
    };
    const action = {
      type: REGISTRATION_FORM.RESET,
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        registrationError: {},
        registrationResult: {},
        formData: {
          country: 'Pakistan',
          email: 'test@email.com',
          name: 'John Doe',
          password: 'johndoe',
          username: 'john',
          marketingOptIn: true,
          errors: {
            email: '',
            name: '',
            username: '',
            password: '',
            country: '',
          },
          emailErrorSuggestion: 'test@email.com',
          emailWarningSuggestion: 'test@email.com',
        },
        validations: null,
        statusCode: null,
        usernameSuggestions: [],
      },
    );
  });

  it('should set formData', () => {
    const state = {
      registrationError: {},
      registrationResult: {},
      formData: {
        country: '',
        email: '',
        name: '',
        password: '',
        username: '',
        marketingOptIn: true,
        errors: {
          email: '',
          name: '',
          username: '',
          password: '',
          country: '',
        },
        emailErrorSuggestion: null,
        emailWarningSuggestion: null,
      },
      validations: null,
      statusCode: null,
      usernameSuggestions: [],
    };
    const formData = {
      country: 'Pakistan',
      email: 'test@email.com',
      name: 'John Doe',
      password: 'johndoe',
      username: 'john',
      marketingOptIn: true,
      errors: {
        email: '',
        name: '',
        username: '',
        password: '',
        country: '',
      },
      emailErrorSuggestion: 'test@email.com',
      emailWarningSuggestion: 'test@email.com',
    };
    const action = {
      type: REGISTER_SET_FORM_DATA,
      payload: { formData },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        registrationError: {},
        registrationResult: {},
        formData: {
          country: 'Pakistan',
          email: 'test@email.com',
          name: 'John Doe',
          password: 'johndoe',
          username: 'john',
          marketingOptIn: true,
          errors: {
            email: '',
            name: '',
            username: '',
            password: '',
            country: '',
          },
          emailErrorSuggestion: 'test@email.com',
          emailWarningSuggestion: 'test@email.com',
        },
        validations: null,
        statusCode: null,
        usernameSuggestions: [],
      },
    );
  });
});
