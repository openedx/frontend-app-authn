import { AsyncActionType } from '../../data/utils';

export const REGISTER_NEW_USER = new AsyncActionType('REGISTRATION', 'REGISTER_NEW_USER');
export const REGISTER_FORM_VALIDATIONS = new AsyncActionType('REGISTRATION', 'GET_FORM_VALIDATIONS');

// Register
export const registerNewUser = registrationInfo => ({
  type: REGISTER_NEW_USER.BASE,
  payload: { registrationInfo },
});

export const registerNewUserBegin = () => ({
  type: REGISTER_NEW_USER.BEGIN,
});

export const registerNewUserSuccess = (redirectUrl, success) => ({
  type: REGISTER_NEW_USER.SUCCESS,
  payload: { redirectUrl, success },

});

export const registerNewUserFailure = (error) => ({
  type: REGISTER_NEW_USER.FAILURE,
  payload: { error },
});

// Realtime Field validations
export const fetchRealtimeValidations = (formPayload) => ({
  type: REGISTER_FORM_VALIDATIONS.BASE,
  payload: { formPayload },
});

export const fetchRealtimeValidationsBegin = () => ({
  type: REGISTER_FORM_VALIDATIONS.BEGIN,
});

export const fetchRealtimeValidationsSuccess = (validations) => ({
  type: REGISTER_FORM_VALIDATIONS.SUCCESS,
  payload: { validations },
});

export const fetchRealtimeValidationsFailure = (error, statusCode) => ({
  type: REGISTER_FORM_VALIDATIONS.FAILURE,
  payload: { error, statusCode },
});
