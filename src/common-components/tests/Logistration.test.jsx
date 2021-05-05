import React from 'react';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import * as analytics from '@edx/frontend-platform/analytics';
import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';

import Logistration from '../Logistration';
import { LOGIN_PAGE } from '../../data/constants';

jest.mock('@edx/frontend-platform/analytics');
analytics.sendPageEvent = jest.fn();

const mockStore = configureStore();
const IntlLogistration = injectIntl(Logistration);

describe('Logistration', () => {
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </IntlProvider>
  );

  it('should render registration page', () => {
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });

    store = mockStore({
      register: {
        registrationResult: { success: false, redirectUrl: '' },
        registrationError: {},
      },
      commonComponents: {
        thirdPartyAuthApiStatus: null,
      },
    });
    const logistration = mount(reduxWrapper(<IntlLogistration />));

    expect(logistration.find('#main-content').find('RegistrationPage').exists()).toBeTruthy();
  });

  it('should render login page', () => {
    store = mockStore({
      login: {
        loginResult: { success: false, redirectUrl: '' },
      },
      commonComponents: {
        thirdPartyAuthApiStatus: null,
      },
    });

    const props = { selectedPage: LOGIN_PAGE };
    const logistration = mount(reduxWrapper(<IntlLogistration {...props} />));

    expect(logistration.find('#main-content').find('LoginPage').exists()).toBeTruthy();
  });
});
