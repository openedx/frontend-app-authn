import { FORGOT_PASSWORD, FORGOT_PASSWORD_PERSIST_FORM_DATA } from './actions';
import { INTERNAL_SERVER_ERROR, PENDING_STATE } from '../../data/constants';
import { PASSWORD_RESET_FAILURE } from '../../reset-password/data/actions';

export const defaultState = {
  status: '',
  submitState: '',
  email: '',
  emailValidationError: '',
};

const reducer = (state = defaultState, action = null) => {
  if (action !== null) {
    switch (action.type) {
      case FORGOT_PASSWORD.BEGIN:
        return {
          email: state.email,
          status: 'pending',
          submitState: PENDING_STATE,
        };
      case FORGOT_PASSWORD.SUCCESS:
        return {
          ...defaultState,
          status: 'complete',
        };
      case FORGOT_PASSWORD.FORBIDDEN:
        return {
          email: state.email,
          status: 'forbidden',
        };
      case FORGOT_PASSWORD.FAILURE:
        return {
          email: state.email,
          status: INTERNAL_SERVER_ERROR,
        };
      case PASSWORD_RESET_FAILURE:
        return {
          status: action.payload.errorCode,
        };
      case FORGOT_PASSWORD_PERSIST_FORM_DATA: {
        const { forgotPasswordFormData } = action.payload;
        return {
          ...state,
          ...forgotPasswordFormData,
        };
      }
      default:
        return {
          ...defaultState,
          email: state.email,
          emailValidationError: state.emailValidationError,
        };
    }
  }
  return state;
};

export default reducer;
