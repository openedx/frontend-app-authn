import { GET_FIELDS_DATA, SAVE_USER_PROFILE } from './actions';
import {
  DEFAULT_STATE, PENDING_STATE, COMPLETE_STATE, FAILURE_STATE,
} from '../../data/constants';

export const defaultState = {
  extendedProfile: [],
  fieldDescriptions: {},
  formRenderState: DEFAULT_STATE,
  success: false,
  submitState: DEFAULT_STATE,
  showError: false,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case GET_FIELDS_DATA.BEGIN:
      return {
        ...state,
        formRenderState: PENDING_STATE,
      };
    case GET_FIELDS_DATA.SUCCESS:
      return {
        ...state,
        extendedProfile: action.payload.extendedProfile,
        fieldDescriptions: action.payload.data,
        formRenderState: COMPLETE_STATE,
      };
    case GET_FIELDS_DATA.FAILURE:
      return {
        ...state,
        formRenderState: FAILURE_STATE,
      };
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
