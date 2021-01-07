// URL Paths
export const LOGIN_PAGE = '/login';
export const REGISTER_PAGE = '/register';
export const RESET_PAGE = '/reset';
export const DEFAULT_REDIRECT_URL = '/dashboard';
export const PASSWORD_RESET_CONFIRM = '/password_reset_confirm/:token/';
export const PAGE_NOT_FOUND = '/notfound';
export const ENTERPRISE_LOGIN_URL = '/enterprise/login';

// Constants
export const SUPPORTED_ICON_CLASSES = ['apple', 'facebook', 'google', 'microsoft'];

// States
export const DEFAULT_STATE = 'default';
export const PENDING_STATE = 'pending';
export const COMPLETE_STATE = 'complete';

export const REGISTRATION_VALIDITY_MAP = {};
export const REGISTRATION_OPTIONAL_MAP = {};
export const REGISTRATION_EXTRA_FIELDS = [
  'confirm_email',
  'level_of_education',
  'gender',
  'year_of_birth',
  'mailing_address',
  'goals',
  'honor_code',
  'terms_of_service',
  'city',
  'country',
];

export const VALID_EMAIL_REGEX = '(^[-!#$%&\'*+/=?^_`{}|~0-9A-Z]+(\\.[-!#$%&\'*+/=?^_`{}|~0-9A-Z]+)*'
                                 + '|^"([\\001-\\010\\013\\014\\016-\\037!#-\\[\\]-\\177]|\\\\[\\001-\\011\\013\\014\\016-\\177])*"'
                                 + ')@((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\\.)+)(?:[A-Z0-9-]{2,63})'
                                 + '|\\[(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\]$';
