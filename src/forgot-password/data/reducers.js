import { FORGOT_PASSWORD } from './actions';
import { INTERNAL_SERVER_ERROR, PENDING_STATE } from '../../data/constants';
import { PASSWORD_RESET_FAILURE } from '../../reset-password/data/actions';

export const defaultState = {
  status: '',
  submitState: '',
  email: '',
};

const reducer = (state = defaultState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case FORGOT_PASSWORD.BEGIN:
        return {
          status: 'pending',
          submitState: PENDING_STATE,
        };
      case FORGOT_PASSWORD.SUCCESS:
        return {
          ...action.payload,
          status: 'complete',
        };
      case FORGOT_PASSWORD.FORBIDDEN:
        return {
          status: 'forbidden',
        };
      case FORGOT_PASSWORD.FAILURE:
        return {
          status: INTERNAL_SERVER_ERROR,
        };
      case PASSWORD_RESET_FAILURE:
        return {
          status: action.payload.errorCode,
        };
      default:
        return defaultState;
    }
  }
  return state;
};

export default reducer;
