import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { IntlProvider, injectIntl, configure } from '@edx/frontend-platform/i18n';

import RegistrationPage from '../RegistrationPage';

const IntlRegistrationPage = injectIntl(RegistrationPage);
const mockStore = configureStore();

describe('./RegistrationPage.js', () => {
  const initialState = {
    logistration: {
      registrationResult: { success: false, redirectUrl: '' },
    },
  };

  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: {
        'es-419': {},
        de: {},
        'en-us': {},
      },
    });
    store = mockStore(initialState);
    props = {
      registrationResult: jest.fn(),
    };
  });

  it('should match default section snapshot', () => {
    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should match url after redirection', () => {
    const dasboardUrl = 'http://test.com/testing-dashboard/';
    store = mockStore({
      ...store,
      logistration: {
        ...store.logistration,
        registrationResult: {
          success: true,
          redirectUrl: dasboardUrl,
        },
      },
    });
    delete window.location;
    window.location = { href: '' };
    renderer.create(reduxWrapper(<IntlRegistrationPage />));
    expect(window.location.href).toBe(dasboardUrl);
  });
});
