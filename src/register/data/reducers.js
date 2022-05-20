import {
  REGISTRATION_FORM,
  REGISTER_NEW_USER,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_PERSIST_FORM_DATA,
} from './actions';

import {
  DEFAULT_STATE,
  PENDING_STATE,
} from '../../data/constants';

export const defaultState = {
  registrationError: {},
  registrationResult: {},
  registrationFormData: {
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
    emailFieldBorderClass: '',
    emailErrorSuggestion: null,
    emailWarningSuggestion: null,
  },
  validations: null,
  statusCode: null,
  usernameSuggestions: [],
  extendedProfile: [],
  fieldDescriptions: {},
  formRenderState: DEFAULT_STATE,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case REGISTRATION_FORM.RESET:
      return {
        ...defaultState,
        registrationFormData: state.registrationFormData,
        usernameSuggestions: state.usernameSuggestions,
      };
    case REGISTER_NEW_USER.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
        registrationError: {},
      };
    case REGISTER_NEW_USER.SUCCESS:
      return {
        ...state,
        registrationResult: action.payload,
      };
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
    case REGISTER_FORM_VALIDATIONS.BEGIN:
      return {
        ...state,
      };
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
        statusCode: 403,
        validations: null,
      };
    case REGISTER_CLEAR_USERNAME_SUGGESTIONS:
      return {
        ...state,
        usernameSuggestions: [],
      };
    case REGISTER_PERSIST_FORM_DATA: {
      const { registrationFormData } = action.payload;
      return {
        ...state,
        registrationFormData,
      };
    }
    default:
      return state;
  }
};

export default reducer;
