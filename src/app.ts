import { App } from '@openedx/frontend-base';
import { appId } from './constants';
import provides from './provides';
import routes from './routes';

const app: App = {
  appId,
  routes,
  provides,
  defaultConfig: {
    DISABLE_ENTERPRISE_LOGIN: true,
    LOGO_URL: 'https://edx-cdn.org/v3/default/logo.svg',
    LOGO_WHITE_URL: 'https://edx-cdn.org/v3/default/logo-white.svg',
  },
};

export default app;
