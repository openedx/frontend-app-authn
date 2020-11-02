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
    store = mockStore(initialState);
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
    props = {
      registrationResult: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('should show error message on 409', () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      scrollTo: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    store = mockStore({
      ...store,
      logistration: {
        ...store.logistration,
        registrationResult: {
          success: false,
          redirectUrl: '',
        },
        registrationError: {
          email: [
            {
              user_message: 'It looks like test@gmail.com belongs to an existing account. Try again with a different email address.',
            },
          ],
          username: [
            {
              user_message: 'It looks like test belongs to an existing account. Try again with a different username.',
            },
          ],
        },
        response_status: 'complete',
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
