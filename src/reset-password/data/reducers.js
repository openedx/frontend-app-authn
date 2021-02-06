import { RESET_PASSWORD, VALIDATE_TOKEN } from './actions';

export const defaultState = {
  status: null,
  token_status: 'pending',
  token: null,
  errors: null,
};

const reducer = (state = defaultState, action = null) => {
  switch (action.type) {
    case VALIDATE_TOKEN.BEGIN:
      return {
        ...state,
        token_status: 'pending',
      };
    case VALIDATE_TOKEN.SUCCESS:
      return {
        ...state,
        token_status: 'valid',
        token: action.payload.token,
      };
    case VALIDATE_TOKEN.FAILURE:
      return {
        ...state,
        token_status: 'invalid',
        errorCode: action.payload.errorCode,
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
        errorCode: action.payload.errorCode,
      };
    default:
      return state;
  }
};

export default reducer;
