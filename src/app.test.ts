import { addAppConfigs, getAppConfig, mergeSiteConfig } from '@openedx/frontend-base';

import app from './app';
import provides from './provides';
import routes from './routes';
import { appId } from './constants';

const defaults = {
  DISABLE_ENTERPRISE_LOGIN: true,
  LOGO_URL: 'https://edx-cdn.org/v3/default/logo.svg',
  LOGO_WHITE_URL: 'https://edx-cdn.org/v3/default/logo-white.svg',
};

describe('authnApp', () => {
  it('declares the authn appId, routes, and provides', () => {
    expect(app.appId).toBe(appId);
    expect(app.routes).toBe(routes);
    expect(app.provides).toBe(provides);
  });

  it('bundles only the defaults that have to work out of the box', () => {
    expect(app.defaultConfig).toEqual(defaults);
  });

  it('leaves config to the operator', () => {
    expect(app.config).toBeUndefined();
  });
});

describe('config resolution', () => {
  it('gives a site that configures nothing the bundled defaults', () => {
    mergeSiteConfig({ apps: [app] });
    addAppConfigs();

    expect(getAppConfig(appId)).toMatchObject(defaults);
  });

  it('lets the operator site-wide config beat a bundled default', () => {
    mergeSiteConfig({
      apps: [app],
      commonAppConfig: { LOGO_WHITE_URL: 'https://operator.example.com/logo-white.svg' },
    });
    addAppConfigs();

    expect(getAppConfig(appId).LOGO_WHITE_URL).toBe('https://operator.example.com/logo-white.svg');
  });

  it('lets the operator per-app config beat the site-wide one', () => {
    mergeSiteConfig({
      apps: [{ ...app, config: { LOGO_WHITE_URL: 'https://per-app.example.com/logo-white.svg' } }],
      commonAppConfig: { LOGO_WHITE_URL: 'https://operator.example.com/logo-white.svg' },
    });
    addAppConfigs();

    expect(getAppConfig(appId).LOGO_WHITE_URL).toBe('https://per-app.example.com/logo-white.svg');
  });
});
