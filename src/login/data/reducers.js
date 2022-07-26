import { DEFAULT_STATE, PENDING_STATE } from '../../data/constants';
import { RESET_PASSWORD } from '../../reset-password';
import { LOGIN_PERSIST_FORM_DATA, LOGIN_REQUEST } from './actions';

export const defaultState = {
  loginError: null,
  loginResult: {},
  resetPassword: false,
  loginFormData: {
    password: '',
    emailOrUsername: '',
    errors: {
      emailOrUsername: '',
      password: '',
    },
  },
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
        resetPassword: false,
      };
    case LOGIN_REQUEST.SUCCESS:
      return {
        ...state,
        loginResult: action.payload,
      };
    case LOGIN_REQUEST.FAILURE:
      return {
        ...state,
        loginError: action.payload.loginError,
        submitState: DEFAULT_STATE,
      };
    case LOGIN_REQUEST.RESET:
      return {
        ...state,
        loginError: null,
      };
    case RESET_PASSWORD.SUCCESS:
      return {
        ...state,
        resetPassword: true,
      };
    case LOGIN_PERSIST_FORM_DATA: {
      const { formData } = action.payload;
      return {
        ...state,
        resetPassword: false,
        loginFormData: {
          ...state.loginFormData,
          ...formData,
        },
      };
    }
    default:
      return {
        ...state,
      };
  }
};

export default reducer;
