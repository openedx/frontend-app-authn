import { EnvironmentTypes, SiteConfig } from '@openedx/frontend-base';

import { authnApp } from './src';

import './src/app.scss';

const siteConfig: SiteConfig = {
  siteId: 'authn-dev',
  siteName: 'Authn Dev',
  baseUrl: 'http://apps.local.openedx.io:8080',
  lmsBaseUrl: 'http://local.openedx.io:8000',
  loginUrl: 'http://local.openedx.io:8000/login',
  logoutUrl: 'http://local.openedx.io:8000/logout',

  environment: EnvironmentTypes.DEVELOPMENT,
  basename: '/authn',
  apps: [authnApp],
};

export default siteConfig;
