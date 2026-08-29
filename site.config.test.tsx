import type { SiteConfig } from '@openedx/frontend-base';

import { appId } from './src/constants';

const siteConfig: SiteConfig = {
  siteId: 'test-site',
  siteName: 'Test Site',
  baseUrl: 'http://localhost:1996',
  lmsBaseUrl: 'http://localhost:8000',
  loginUrl: 'http://localhost:8000/login',
  logoutUrl: 'http://localhost:8000/logout',

  // Use 'test' instead of EnvironmentTypes.TEST to break a circular dependency
  // when mocking `@openedx/frontend-base` itself.
  environment: 'test' as SiteConfig['environment'],
  // The operator layer for tests.  Only the values a test relies on and does not set
  // itself belong here; everything else is absent, as it is on a stock site.
  apps: [{
    appId,
    config: {
      DISABLE_ENTERPRISE_LOGIN: true,
      MARKETING_SITE_BASE_URL: 'http://localhost:18000',
    },
  }],
};

export default siteConfig;
