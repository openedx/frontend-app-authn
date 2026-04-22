import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';

import { authnApp } from './src';

import '@openedx/frontend-base/shell/style';

const siteConfig: SiteConfig = {
  siteId: 'authn-ci',
  siteName: 'Authn CI',
  baseUrl: 'http://apps.local.openedx.io',
  lmsBaseUrl: 'http://local.openedx.io',
  loginUrl: 'http://local.openedx.io/login',
  logoutUrl: 'http://local.openedx.io/logout',

  environment: EnvironmentTypes.PRODUCTION,
  apps: [
    shellApp,
    headerApp,
    footerApp,
    authnApp,
  ],
};

export default siteConfig;
