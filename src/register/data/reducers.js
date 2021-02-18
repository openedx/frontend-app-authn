import { REGISTER_NEW_USER, REGISTER_FORM_VALIDATIONS } from './actions';

import { DEFAULT_STATE, PENDING_STATE } from '../../data/constants';

export const defaultState = {
  registrationError: null,
  registrationResult: {},
  formData: null,
  validations: null,
  statusCode: null,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case REGISTER_NEW_USER.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
      };
    case REGISTER_NEW_USER.SUCCESS:
      return {
        ...state,
        registrationResult: action.payload,
      };
    case REGISTER_NEW_USER.FAILURE:
      return {
        ...state,
        registrationError: action.payload.error,
        submitState: DEFAULT_STATE,
      };
    case REGISTER_FORM_VALIDATIONS.BEGIN:
      return {
        ...state,
      };
    case REGISTER_FORM_VALIDATIONS.SUCCESS:
      return {
        ...state,
        validations: action.payload.validations,
      };
    case REGISTER_FORM_VALIDATIONS.FAILURE:
      return {
        ...state,
        validations: action.payload.error,
        statusCode: action.payload.statusCode,
      };
    default:
      return state;
  }
};

export default reducer;
