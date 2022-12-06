import { DEFAULT_STATE } from '../../../data/constants';
import {
  BACKUP_REGISTRATION_DATA,
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  REGISTER_SET_COUNTRY_CODE,
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
