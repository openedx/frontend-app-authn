import { FORGOT_PASSWORD } from './actions';
import { INTERNAL_SERVER_ERROR } from '../../data/constants';

export const defaultState = {
  status: null,
};

const reducer = (state = defaultState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case FORGOT_PASSWORD.BEGIN:
        return {
          status: 'pending',
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
      default:
        return state;
    }
  }
  return state;
};

export default reducer;
