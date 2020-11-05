import {
  REGISTER_NEW_USER,
  LOGIN_REQUEST,
  TPA_PROVIDERS,
} from './actions';

export const defaultState = {
  registrationResult: {},
  loginResult: {},
  tpaProviders: {},
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case REGISTER_NEW_USER.BEGIN:
      return {
        ...state,
      };
    case REGISTER_NEW_USER.SUCCESS:
      return {
        ...state,
      };
    case REGISTER_NEW_USER.FAILURE:
      return {
        ...state,
      };
    case LOGIN_REQUEST.BEGIN:
      return {
        ...state,
      };
    case LOGIN_REQUEST.SUCCESS:
      return {
        ...state,
        loginResult: action.payload,
      };
    case LOGIN_REQUEST.FAILURE:
      return {
        ...state,
      };
    case TPA_PROVIDERS.BEGIN:
      return {
        ...state,
      };
    case TPA_PROVIDERS.SUCCESS:
      return {
        ...state,
        tpaProviders: action.payload,
      };
    case TPA_PROVIDERS.FAILURE:
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default reducer;
