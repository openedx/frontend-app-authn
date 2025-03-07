// URL Paths
export const LOGIN_PAGE = '/login';
export const REGISTER_PAGE = '/register';
export const REGISTER_EMBEDDED_PAGE = '/register-embedded';
export const RESET_PAGE = '/reset';
export const AUTHN_PROGRESSIVE_PROFILING = '/welcome';
export const DEFAULT_REDIRECT_URL = '/dashboard';
export const RECOMMENDATIONS = '/recommendations';
export const PASSWORD_RESET_CONFIRM = '/password_reset_confirm/:token/';
export const PAGE_NOT_FOUND = '/notfound';
export const ENTERPRISE_LOGIN_URL = '/enterprise/login';

// Constants
export const SUPPORTED_ICON_CLASSES = ['apple', 'facebook', 'google', 'microsoft'];

// Error Codes
export const FORM_SUBMISSION_ERROR = 'form-submission-error';
export const INTERNAL_SERVER_ERROR = 'internal-server-error';
export const API_RATELIMIT_ERROR = 'api-ratelimit-error';

// Common States
export const DEFAULT_STATE = 'default';
export const PENDING_STATE = 'pending';
export const COMPLETE_STATE = 'complete';
export const FAILURE_STATE = 'failure';
export const FORBIDDEN_STATE = 'forbidden';
export const EMBEDDED = 'embedded';

export const LETTER_REGEX = /[a-zA-Z]/;
export const NUMBER_REGEX = /\d/;
export const VALID_EMAIL_REGEX = '(^[-!#$%&\'*+/=?^_`{}|~0-9A-Z]+(\\.[-!#$%&\'*+/=?^_`{}|~0-9A-Z]+)*'
                                 + '|^"([\\001-\\010\\013\\014\\016-\\037!#-\\[\\]-\\177]|\\\\[\\001-\\011\\013\\014\\016-\\177])*"'
                                 + ')@((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\\.)+)(?:[A-Z0-9-]{2,63})'
                                 + '|\\[(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\]$';

// Query string parameters that can be passed to LMS to manage
// things like auto-enrollment upon login and registration.
export const AUTH_PARAMS = ['course_id', 'enrollment_action', 'course_mode', 'email_opt_in', 'purchase_workflow', 'next', 'register_for_free', 'track', 'is_account_recovery', 'variant', 'host', 'cta'];
export const REDIRECT = 'redirect';
