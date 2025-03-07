import { SAVE_USER_PROFILE } from './actions';
import {
  DEFAULT_STATE, PENDING_STATE,
} from '../../data/constants';

export const defaultState = {
  extendedProfile: [],
  fieldDescriptions: {},
  success: false,
  submitState: DEFAULT_STATE,
  showError: false,
};

const reducer = (state = defaultState, action = {}) => {
  switch (action.type) {
    case SAVE_USER_PROFILE.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
      };
    case SAVE_USER_PROFILE.SUCCESS:
      return {
        ...state,
        success: true,
        showError: false,
      };
    case SAVE_USER_PROFILE.FAILURE:
      return {
        ...state,
        submitState: DEFAULT_STATE,
        showError: true,
      };
    default:
      return state;
  }
};

export default reducer;
