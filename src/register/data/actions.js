import { AsyncActionType } from '../../data/utils';

export const BACKUP_REGISTRATION_DATA = new AsyncActionType('REGISTRATION', 'BACKUP_REGISTRATION_DATA');
export const REGISTER_FORM_VALIDATIONS = new AsyncActionType('REGISTRATION', 'GET_FORM_VALIDATIONS');
export const REGISTER_NEW_USER = new AsyncActionType('REGISTRATION', 'REGISTER_NEW_USER');
export const REGISTER_CLEAR_USERNAME_SUGGESTIONS = 'REGISTRATION_CLEAR_USERNAME_SUGGESTIONS';
export const REGISTRATION_CLEAR_BACKEND_ERROR = 'REGISTRATION_CLEAR_BACKEND_ERROR';
export const REGISTER_SET_COUNTRY_CODE = 'REGISTER_SET_COUNTRY_CODE';
export const REGISTER_SET_USER_PIPELINE_DATA_LOADED = 'REGISTER_SET_USER_PIPELINE_DATA_LOADED';
export const REGISTER_SET_EMAIL_SUGGESTIONS = 'REGISTER_SET_EMAIL_SUGGESTIONS';

// Backup registration form
export const backupRegistrationForm = () => ({
  type: BACKUP_REGISTRATION_DATA.BASE,
});

export const backupRegistrationFormBegin = (data) => ({
  type: BACKUP_REGISTRATION_DATA.BEGIN,
  payload: { ...data },
});

// Validate fields from the backend
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

export const fetchRealtimeValidationsFailure = () => ({
  type: REGISTER_FORM_VALIDATIONS.FAILURE,
});

// Set email field frontend validations
export const setEmailSuggestionInStore = (emailSuggestion) => ({
  type: REGISTER_SET_EMAIL_SUGGESTIONS,
  payload: { emailSuggestion },
});

// Register
export const registerNewUser = registrationInfo => ({
  type: REGISTER_NEW_USER.BASE,
  payload: { registrationInfo },
});

export const registerNewUserBegin = () => ({
  type: REGISTER_NEW_USER.BEGIN,
});

export const registerNewUserSuccess = (authenticatedUser, redirectUrl, success) => ({
  type: REGISTER_NEW_USER.SUCCESS,
  payload: { authenticatedUser, redirectUrl, success },

});

export const registerNewUserFailure = (error) => ({
  type: REGISTER_NEW_USER.FAILURE,
  payload: { ...error },
});

export const clearUsernameSuggestions = () => ({
  type: REGISTER_CLEAR_USERNAME_SUGGESTIONS,
});

export const clearRegistrationBackendError = (fieldName) => ({
  type: REGISTRATION_CLEAR_BACKEND_ERROR,
  payload: fieldName,
});

export const setCountryFromThirdPartyAuthContext = (countryCode) => ({
  type: REGISTER_SET_COUNTRY_CODE,
  payload: { countryCode },
});

export const setUserPipelineDataLoaded = (value) => ({
  type: REGISTER_SET_USER_PIPELINE_DATA_LOADED,
  payload: { value },
});
