import {
  DEFAULT_STATE,
  PENDING_STATE,
} from '../../data/constants';
import {
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  REGISTRATION_FORM,
} from './actions';

export const defaultState = {
  registrationError: {},
  registrationResult: {},
  formData: null,
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
    default:
      return state;
  }
};

export default reducer;
