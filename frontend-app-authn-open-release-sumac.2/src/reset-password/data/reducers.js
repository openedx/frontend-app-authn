import { PASSWORD_RESET_FAILURE, RESET_PASSWORD, VALIDATE_TOKEN } from './actions';
import { PASSWORD_RESET_ERROR, TOKEN_STATE } from './constants';

export const defaultState = {
  status: TOKEN_STATE.PENDING,
  token: null,
  errorMsg: null,
};

const reducer = (state = defaultState, action = null) => {
  switch (action.type) {
    case VALIDATE_TOKEN.SUCCESS:
      return {
        ...state,
        status: TOKEN_STATE.VALID,
        token: action.payload.token,
      };
    case PASSWORD_RESET_FAILURE:
      return {
        ...state,
        status: PASSWORD_RESET_ERROR,
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
        status: action.payload.errorCode,
        errorMsg: action.payload.errorMsg,
      };
    default:
      return state;
  }
};

export default reducer;
