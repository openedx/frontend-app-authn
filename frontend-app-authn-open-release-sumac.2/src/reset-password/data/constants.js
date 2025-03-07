export const TOKEN_STATE = {
  PENDING: 'token-pending',
  VALID: 'token-valid',
};

// password reset error codes
export const FORM_SUBMISSION_ERROR = 'form-submission-error';
export const PASSWORD_RESET_ERROR = 'password-reset-error';
export const SUCCESS = 'success';
export const PASSWORD_VALIDATION_ERROR = 'password-validation-failure';

export const PASSWORD_RESET = {
  INVALID_TOKEN: 'invalid-token',
  INTERNAL_SERVER_ERROR: 'password-reset-internal-server-error',
  FORBIDDEN_REQUEST: 'password-reset-rate-limit-error',
};
