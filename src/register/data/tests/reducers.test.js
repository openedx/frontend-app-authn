import { DEFAULT_STATE } from '../../../data/constants';
import {
  BACKUP_REGISTRATION_DATA,
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  REGISTER_SET_COUNTRY_CODE,
} from '../actions';
import reducer from '../reducers';

describe('register reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        registrationError: {},
        registrationResult: {},
        registrationFormData: {
          configurableFormFields: {},
          formFields: {
            name: '', email: '', username: '', password: '', marketingEmailsOptIn: true,
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
        validationApiRateLimited: false,
        usernameSuggestions: [],
        shouldBackupState: false,
      },
    );
  });

  it('should set username suggestions upon validation failed case', () => {
    const state = {
      usernameSuggestions: [],
    };

    const validations = { usernameSuggestions: ['test12'], validationDecisions: {} };
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
    const state = {
      usernameSuggestions: [],
    };
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
      registrationFormData: {
        configurableFormFields: {},
        formFields: {
          name: '', email: '', username: '', password: '', marketingEmailsOptIn: true,
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
      validationApiRateLimited: false,
      usernameSuggestions: ['test1', 'test2'],
      shouldBackupState: false,
    };
    const action = {
      type: BACKUP_REGISTRATION_DATA.BEGIN,
      payload: { ...state.registrationFormData },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      state,
    );
  });

  it('should set country code from context', () => {
    const state = {
      registrationFormData: {
        configurableFormFields: {},
        formFields: {
          name: '', email: '', username: '', password: '', marketingEmailsOptIn: true,
        },
        emailSuggestion: {
          suggestion: '', type: '',
        },
        errors: {
          name: '', email: '', username: '', password: '',
        },
      },
    };
    const countryCode = 'PK';

    const action = {
      type: REGISTER_SET_COUNTRY_CODE,
      payload: { countryCode },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        registrationFormData: {
          ...state.registrationFormData,
          country: 'PK',
        },
      },
    );
  });
});
