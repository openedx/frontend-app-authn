import {
  BACKUP_REGISTRATION_DATA,
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  REGISTER_SET_COUNTRY_CODE,
  REGISTER_SET_EMAIL_SUGGESTIONS,
  REGISTER_SET_USER_PIPELINE_DATA_LOADED,
  REGISTRATION_CLEAR_BACKEND_ERROR,
} from './actions';
import {
  DEFAULT_STATE,
  PENDING_STATE,
} from '../../data/constants';

export const storeName = 'register';

export const defaultState = {
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

const reducer = (state = defaultState, action = {}) => {
  switch (action.type) {
    case BACKUP_REGISTRATION_DATA.BASE:
      return {
        ...state,
        shouldBackupState: true,
      };
    case BACKUP_REGISTRATION_DATA.BEGIN:
      return {
        ...state,
        usernameSuggestions: state.usernameSuggestions,
        registrationFormData: { ...action.payload },
        userPipelineDataLoaded: state.userPipelineDataLoaded,
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
    case REGISTRATION_CLEAR_BACKEND_ERROR: {
      const registrationErrorTemp = state.registrationError;
      delete registrationErrorTemp[action.payload];
      return {
        ...state,
        registrationError: { ...registrationErrorTemp },
      };
    }
    case REGISTER_FORM_VALIDATIONS.SUCCESS: {
      const { usernameSuggestions, ...validationWithoutUsernameSuggestions } = action.payload.validations;
      return {
        ...state,
        validations: validationWithoutUsernameSuggestions,
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
      if (!state.registrationFormData.configurableFormFields.country) {
        return {
          ...state,
          backendCountryCode: countryCode,
        };
      }
      return state;
    }
    case REGISTER_SET_USER_PIPELINE_DATA_LOADED: {
      const { value } = action.payload;
      return {
        ...state,
        userPipelineDataLoaded: value,
      };
    }
    case REGISTER_SET_EMAIL_SUGGESTIONS:
      return {
        ...state,
        registrationFormData: {
          ...state.registrationFormData,
          emailSuggestion: action.payload.emailSuggestion,
        },
      };
    default:
      return {
        ...state,
        shouldBackupState: false,
      };
  }
};

export default reducer;
