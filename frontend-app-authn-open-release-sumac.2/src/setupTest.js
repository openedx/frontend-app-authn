/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-classes-per-file */

import { getConfig } from '@edx/frontend-platform';
import { configure as configureLogging } from '@edx/frontend-platform/logging';

class MockLoggingService {
  logInfo = jest.fn();

  logError = jest.fn();
}

export default function initializeMockLogging() {
  const loggingService = configureLogging(MockLoggingService, {
    config: getConfig(),
  });

  return { loggingService };
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
    getItem: (key) => (store[key] || null),
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
