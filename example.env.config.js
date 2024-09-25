/*
Authn MFE is now able to handle JS-based configuration!

For the time being, the `.env.*` files are still made available when cloning down this repo or pulling from
the master branch. To switch to using `env.config.js`, make a copy of `example.env.config.js` and configure as needed.

For testing with Jest Snapshot, there is a mock in `/src/setupTest.jsx` for `getConfig` that will need to be
uncommented.

Note: having both .env and env.config.js files will follow a predictable order, in which non-empty values in the
JS-based config will overwrite the .env environment variables.

frontend-platform's getConfig loads configuration in the following sequence:
- .env file config
- optional handlers (commonly used to merge MFE-specific config in via additional process.env variables)
- env.config.js file config
- runtime config
*/

module.exports = {
  NODE_ENV: 'development',
  NODE_PATH: './src',
  PORT: 1999,
  ACCESS_TOKEN_COOKIE_NAME: 'edx-jwt-cookie-header-payload',
  BASE_URL: 'http://localhost:1999',
  CREDENTIALS_BASE_URL: 'http://localhost:18150',
  CSRF_TOKEN_API_PATH: '/csrf/api/v1/token',
  ECOMMERCE_BASE_URL: 'http://localhost:18130',
  LANGUAGE_PREFERENCE_COOKIE_NAME: 'openedx-language-preference',
  LMS_BASE_URL: 'http://localhost:18000',
  LOGIN_URL: 'http://localhost:1999/login',
  LOGOUT_URL: 'http://localhost:18000/logout',
  LOGO_URL: 'https://edx-cdn.org/v3/default/logo.svg',
  LOGO_TRADEMARK_URL: 'https://edx-cdn.org/v3/default/logo-trademark.svg',
  LOGO_WHITE_URL: 'https://edx-cdn.org/v3/default/logo-white.svg',
  FAVICON_URL: 'https://edx-cdn.org/v3/default/favicon.ico',
  MARKETING_SITE_BASE_URL: 'http://localhost:18000',
  ORDER_HISTORY_URL: 'http://localhost:1996/orders',
  REFRESH_ACCESS_TOKEN_ENDPOINT: 'http://localhost:18000/login_refresh',
  SEGMENT_KEY: '',
  SITE_NAME: 'Your Platform Name Here',
  INFO_EMAIL: 'info@example.com',
  ENABLE_DYNAMIC_REGISTRATION_FIELDS: 'true',
  ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: 'true',
  SESSION_COOKIE_DOMAIN: 'localhost',
  USER_INFO_COOKIE_NAME: 'edx-user-info',
  LOGIN_ISSUE_SUPPORT_LINK: 'http://localhost:18000/login-issue-support-url',
  TOS_AND_HONOR_CODE: 'http://localhost:18000/honor',
  TOS_LINK: 'http://localhost:18000/tos',
  PRIVACY_POLICY: 'http://localhost:18000/privacy',
  AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: 'http://localhost:1999/welcome',
  BANNER_IMAGE_LARGE: '',
  BANNER_IMAGE_MEDIUM: '',
  BANNER_IMAGE_SMALL: '',
  BANNER_IMAGE_EXTRA_SMALL: '',
  APP_ID: '',
  MFE_CONFIG_API_URL: '',
  ZENDESK_KEY: '',
  ZENDESK_LOGO_URL: '',
};
