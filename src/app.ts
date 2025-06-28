import { App } from '@openedx/frontend-base';
import { appId } from './constants';
import routes from './routes';
import messages from './i18n';

const app: App = {
  appId,
  routes,
  messages,
  config: {
    ACTIVATION_EMAIL_SUPPORT_LINK: null,
    ALLOW_PUBLIC_ACCOUNT_CREATION: true,
    AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: null,
    BANNER_IMAGE_EXTRA_SMALL: '',
    BANNER_IMAGE_LARGE: '',
    BANNER_IMAGE_MEDIUM: '',
    BANNER_IMAGE_SMALL: '',
    DISABLE_ENTERPRISE_LOGIN: true,
    ENABLE_AUTO_GENERATED_USERNAME: false,
    ENABLE_DYNAMIC_REGISTRATION_FIELDS: false,
    ENABLE_IMAGE_LAYOUT: false,
    ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: false,
    FAVICON_URL: 'https://edx-cdn.org/v3/default/favicon.ico',
    INFO_EMAIL: '',
    LOGIN_ISSUE_SUPPORT_LINK: null,
    LOGO_TRADEMARK_URL: 'https://edx-cdn.org/v3/default/logo-trademark.svg',
    LOGO_URL: 'https://edx-cdn.org/v3/default/logo.svg',
    LOGO_WHITE_URL: 'https://edx-cdn.org/v3/default/logo-white.svg',
    MARKETING_EMAILS_OPT_IN: '',
    MARKETING_SITE_BASE_URL: 'http://local.openedx.io',
    PASSWORD_RESET_SUPPORT_LINK: null,
    POST_REGISTRATION_REDIRECT_URL: '',
    PRIVACY_POLICY: null,
    SEARCH_CATALOG_URL: null,
    SESSION_COOKIE_DOMAIN: 'local.openedx.io',
    SHOW_REGISTRATION_LINKS: true,
    TOS_AND_HONOR_CODE: null,
    TOS_LINK: null,
    USER_RETENTION_COOKIE_NAME: '',
  },
};

export default app;
