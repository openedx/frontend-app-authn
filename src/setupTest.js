import siteConfig from 'site.config';

import { addAppConfigs, configureAnalytics, configureAuth, configureLogging, getSiteConfig, mergeSiteConfig, MockAnalyticsService, MockAuthService, MockLoggingService } from '@openedx/frontend-base';

mergeSiteConfig(siteConfig);
addAppConfigs();

export const testAppId = getSiteConfig().apps[0].appId;

export function initializeMockServices() {
  const loggingService = configureLogging(MockLoggingService, {
    config: getSiteConfig(),
  });

  const authService = configureAuth(MockAuthService, {
    config: getSiteConfig(),
    loggingService,
  });

  const analyticsService = configureAnalytics(MockAnalyticsService, {
    config: getSiteConfig(),
    httpClient: authService.getAuthenticatedHttpClient(),
    loggingService,
  });

  return { analyticsService, authService, loggingService };
}

class ResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }

  disconnect() {
    // do nothing
  }
}

window.ResizeObserver = ResizeObserver;
window.scrollTo = (x, y) => {
  document.documentElement.scrollTop = y;
};

const location = new URL('https://authn.edx.org');
location.assign = jest.fn();
location.replace = jest.fn();
location.reload = jest.fn();
delete window.location;
window.location = location;

const localStorageMock = jest.fn(() => {
  let store = {};
  return {
    getItem: (key) => (store[key] ?? null),
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
