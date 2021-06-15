import { LOGIN_REQUEST } from './actions';

import { DEFAULT_STATE, PENDING_STATE } from '../../data/constants';

export const defaultState = {
  loginError: null,
  loginResult: {},
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
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
    default:
      return state;
  }
};

export default reducer;
