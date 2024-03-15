import { getConfig } from '@edx/frontend-platform';

import { DEFAULT_REDIRECT_URL, DEFAULT_STATE, PENDING_STATE } from '../../../data/constants';
import {
  BACKUP_REGISTRATION_DATA,
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  REGISTER_SET_COUNTRY_CODE,
  REGISTER_SET_EMAIL_SUGGESTIONS,
  REGISTER_SET_USER_PIPELINE_DATA_LOADED,
  REGISTRATION_CLEAR_BACKEND_ERROR,
} from '../actions';
import reducer from '../reducers';

describe('Registration Reducer Tests', () => {
  const defaultState = {
    backendCountryCode: '',
    registrationError: {},
    registrationResult: {},
    registrationFormData: {
      configurableFormFields: {
        marketingEmailsOptIn: true,
      },
      formFields: {
        name: '', email: '', username: '', password: '',
      },
      emailSuggestion: {
        suggestion: '', type: '',
      },
      errors: {
        name: '', email: '', username: '', password: '',
      },
    },
    validations: null,
    submitState: DEFAULT_STATE,
    userPipelineDataLoaded: false,
    usernameSuggestions: [],
    validationApiRateLimited: false,
    shouldBackupState: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(defaultState);
  });

  it('should set username suggestions returned by the backend validations', () => {
    const validations = {
      usernameSuggestions: ['test12'],
      validationDecisions: {
        name: '',
      },
    };
    const { usernameSuggestions, ...validationWithoutUsernameSuggestions } = validations;
    const action = {
      type: REGISTER_FORM_VALIDATIONS.SUCCESS,
      payload: { validations },
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        usernameSuggestions,
        validations: validationWithoutUsernameSuggestions,
      },
    );
  });

  it('should set email suggestions', () => {
    const emailSuggestion = {
      type: 'test type',
      suggestion: 'test suggestion',
    };
    const action = {
      type: REGISTER_SET_EMAIL_SUGGESTIONS,
      payload: { emailSuggestion },
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        registrationFormData: {
          ...defaultState.registrationFormData,
          emailSuggestion: {
            type: 'test type', suggestion: 'test suggestion',
          },
        },
      });
  });

  it('should set redirect url dashboard on registration success action', () => {
    const payload = {
      redirectUrl: `${getConfig().BASE_URL}${DEFAULT_REDIRECT_URL}`,
      success: true,
    };
    const action = {
      type: REGISTER_NEW_USER.SUCCESS,
      payload,
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        registrationResult: payload,
      },
    );
  });

  it('should set the registration call and set the registration error object empty', () => {
    const action = {
      type: REGISTER_NEW_USER.BEGIN,
    };

    expect(reducer({
      ...defaultState,
      registrationError: {
        email: 'This email already exist.',
      },
    }, action)).toEqual(
      {
        ...defaultState,
        submitState: PENDING_STATE,
        registrationError: {},
      },
    );
  });

  it('should show username suggestions returned by registration error', () => {
    const payload = { usernameSuggestions: ['test12'] };
    const action = {
      type: REGISTER_NEW_USER.FAILURE,
      payload,
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        registrationError: payload,
        usernameSuggestions: payload.usernameSuggestions,
      },
    );
  });
  it('should set the register user when SSO pipeline data is loaded', () => {
    const payload = { value: true };
    const action = {
      type: REGISTER_SET_USER_PIPELINE_DATA_LOADED,
      payload,
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        userPipelineDataLoaded: true,
      },
    );
  });

  it('should set country code on blur', () => {
    const action = {
      type: REGISTER_SET_COUNTRY_CODE,
      payload: { countryCode: 'PK' },
    };

    expect(reducer({
      ...defaultState,
      registrationFormData: {
        ...defaultState.registrationFormData,
        configurableFormFields: {
          ...defaultState.registrationFormData.configurableFormFields,
          country: {
            name: 'Pakistan',
            code: 'PK',
          },
        },
      },
    }, action)).toEqual(
      {
        ...defaultState,
        registrationFormData: {
          ...defaultState.registrationFormData,
          configurableFormFields: {
            ...defaultState.registrationFormData.configurableFormFields,
            country: {
              name: 'Pakistan',
              code: 'PK',
            },
          },
        },
      },
    );
  });
  it(' registration api failure when api rate limit hits', () => {
    const action = {
      type: REGISTER_FORM_VALIDATIONS.FAILURE,
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        validationApiRateLimited: true,
        validations: null,
      },
    );
  });
  it('should clear username suggestions', () => {
    const state = {
      ...defaultState,
      usernameSuggestions: ['test_1'],
    };
    const action = {
      type: REGISTER_CLEAR_USERNAME_SUGGESTIONS,
    };

    expect(reducer(state, action)).toEqual({ ...defaultState });
  });

  it('should take back data during form reset', () => {
    const state = {
      ...defaultState,
      shouldBackupState: true,
    };
    const action = {
      type: BACKUP_REGISTRATION_DATA.BASE,
    };

    expect(reducer(state, action)).toEqual({
      ...defaultState,
      shouldBackupState: true,
    });
  });

  it('should not reset username suggestions and fields data during form reset', () => {
    const state = {
      ...defaultState,
      usernameSuggestions: ['test1', 'test2'],
    };
    const action = {
      type: BACKUP_REGISTRATION_DATA.BEGIN,
      payload: { ...state.registrationFormData },
    };

    expect(reducer(state, action)).toEqual(state);
  });

  it('should reset email error field data on focus of email field', () => {
    const state = {
      ...defaultState,
      registrationError: { email: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account` },
    };
    const action = {
      type: REGISTRATION_CLEAR_BACKEND_ERROR,
      payload: 'email',
    };

    expect(reducer(state, action)).toEqual({
      ...state,
      registrationError: {},
    });
  });

  it('should set country code', () => {
    const countryCode = 'PK';

    const action = {
      type: REGISTER_SET_COUNTRY_CODE,
      payload: { countryCode },
    };

    expect(reducer(defaultState, action)).toEqual(
      {
        ...defaultState,
        backendCountryCode: countryCode,
      },
    );
  });
});
