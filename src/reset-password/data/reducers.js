import { RESET_PASSWORD, VALIDATE_TOKEN } from './actions';

export const defaultState = {
  status: 'token-pending',
  token: null,
  errors: null,
};

const reducer = (state = defaultState, action = null) => {
  switch (action.type) {
    case VALIDATE_TOKEN.SUCCESS:
      return {
        ...state,
        status: 'valid',
        token: action.payload.token,
      };
    case VALIDATE_TOKEN.FAILURE:
      return {
        ...state,
        status: 'invalid',
        errors: action.payload.errors,
      };
    case RESET_PASSWORD.BEGIN:
      return {
        ...state,
        status: 'pending',
      };
    case RESET_PASSWORD.SUCCESS:
      return {
        ...state,
        status: 'success',
      };
    case RESET_PASSWORD.FAILURE:
      return {
        ...state,
        status: 'failure',
        errors: action.payload.errors,
      };
    default:
      return state;
  }
};

export default reducer;
