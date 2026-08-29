import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';

import { authnApp } from './src';

import '@openedx/frontend-base/shell/style';

const siteConfig: SiteConfig = {
  siteId: 'authn-dev',
  siteName: 'Authn Dev',
  baseUrl: 'http://apps.local.openedx.io:8080',
  lmsBaseUrl: 'http://local.openedx.io:8000',
  loginUrl: 'http://local.openedx.io:8000/login',
  logoutUrl: 'http://local.openedx.io:8000/logout',

  environment: EnvironmentTypes.DEVELOPMENT,
  apps: [
    shellApp,
    headerApp,
    footerApp,
    {
      ...authnApp,
      config: {
        INFO_EMAIL: 'info@local.openedx.io',
        MARKETING_SITE_BASE_URL: 'http://local.openedx.io',
        SESSION_COOKIE_DOMAIN: 'local.openedx.io',
      },
    },
  ],
};

export default siteConfig;
