import {
  BACKUP_REGISTRATION_DATA,
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  REGISTER_SET_COUNTRY_CODE,
  REGISTER_SET_SIMPLIFY_REGISTRATION_EXP_DATA,
  REGISTER_SET_USER_PIPELINE_DATA_LOADED,
  REGISTRATION_CLEAR_BACKEND_ERROR,
} from './actions';
import { FIRST_STEP } from './optimizelyExperiment/helper';
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
  usernameSuggestionsBackup: [], // Temporary field for Simplify registration experiment
  validationApiRateLimited: false,
  shouldBackupState: false,
  simplifyRegExpVariation: '',
  simplifiedRegisterPageStep: FIRST_STEP,
  isValidatingSimplifiedRegisterFirstPage: false,
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
        isValidatingSimplifiedRegisterFirstPage: action.payload?.isValidatingSimplifiedRegisterFirstPage,
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
        usernameSuggestionsBackup: action.payload?.isSuggestionClicked ? state.usernameSuggestions : [],
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
    case REGISTER_SET_SIMPLIFY_REGISTRATION_EXP_DATA: {
      const { simplifyRegExpVariation: expVariation, simplifiedRegisterPageStep: pageStep } = action.payload;
      return {
        ...state,
        simplifyRegExpVariation: expVariation,
        simplifiedRegisterPageStep: pageStep,
        isValidatingSimplifiedRegisterFirstPage: pageStep === FIRST_STEP
          ? false : state.isValidatingSimplifiedRegisterFirstPage,
      };
    }
    default:
      return {
        ...state,
        shouldBackupState: false,
      };
  }
};

export default reducer;
