import {
  DEFAULT_STATE,
  PENDING_STATE,
} from '../../data/constants';
import {
  BACKUP_REGISTRATION_DATA,
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  REGISTER_SET_COUNTRY_CODE,
} from './actions';

export const defaultState = {
  registrationError: {},
  registrationResult: {},
  registrationFormData: {
    formFields: {
      name: '', email: '', username: '', password: '', marketingEmailsOptIn: true,
    },
    errors: {
      name: '', email: '', username: '', password: '',
    },
    emailSuggestion: {
      suggestion: '', type: '',
    },
  },
  validations: null,
  submitState: DEFAULT_STATE,
  validationApiRateLimited: false,
  usernameSuggestions: [],
  shouldBackupState: false,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case BACKUP_REGISTRATION_DATA.BASE:
      return {
        ...state,
        shouldBackupState: true,
      };
    case BACKUP_REGISTRATION_DATA.BEGIN:
      return {
        ...defaultState,
        usernameSuggestions: state.usernameSuggestions,
        registrationFormData: { ...action.payload },
      };
    case REGISTER_NEW_USER.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
        registrationError: {},
      };
    case REGISTER_NEW_USER.SUCCESS: {
      return {
        ...state,
        registrationResult: action.payload,
      };
    }
    case REGISTER_NEW_USER.FAILURE: {
      const { usernameSuggestions } = action.payload;
      return {
        ...state,
        registrationError: { ...action.payload },
        submitState: DEFAULT_STATE,
        validations: null,
        usernameSuggestions: usernameSuggestions || state.usernameSuggestions,
      };
    }
    case REGISTER_FORM_VALIDATIONS.SUCCESS: {
      const { usernameSuggestions } = action.payload.validations;
      return {
        ...state,
        validations: action.payload.validations,
        usernameSuggestions: usernameSuggestions || state.usernameSuggestions,
      };
    }
    case REGISTER_FORM_VALIDATIONS.FAILURE:
      return {
        ...state,
        validationApiRateLimited: true,
        validations: null,
      };
    case REGISTER_CLEAR_USERNAME_SUGGESTIONS:
      return {
        ...state,
        usernameSuggestions: [],
      };
    case REGISTER_SET_COUNTRY_CODE: {
      const { countryCode } = action.payload;
      if (state.registrationFormData.country === '') {
        return {
          ...state,
          registrationFormData: {
            ...state.registrationFormData,
            country: countryCode,
            errors: { ...state.registrationFormData.errors, country: '' },
          },
        };
      }
      return state;
    }
    default:
      return {
        ...state,
        shouldBackupState: false,
      };
  }
};

export default reducer;
