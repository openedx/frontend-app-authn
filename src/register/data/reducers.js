import { REGISTRATION_FORM, REGISTER_NEW_USER, REGISTER_FORM_VALIDATIONS } from './actions';

import { DEFAULT_STATE, PENDING_STATE } from '../../data/constants';

export const defaultState = {
  registrationError: {},
  registrationResult: {},
  formData: null,
  validations: null,
  statusCode: null,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case REGISTRATION_FORM.RESET:
      return {
        ...defaultState,
      };
    case REGISTER_NEW_USER.BEGIN:
      return {
        ...state,
        submitState: PENDING_STATE,
        registrationError: {},
      };
    case REGISTER_NEW_USER.SUCCESS:
      return {
        ...state,
        registrationResult: action.payload,
      };
    case REGISTER_NEW_USER.FAILURE:
      return {
        ...state,
        registrationError: { ...action.payload },
        submitState: DEFAULT_STATE,
        validations: null,
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
        statusCode: 403,
        validations: null,
      };
    default:
      return state;
  }
};

export default reducer;
