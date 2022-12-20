import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import * as auth from '@edx/frontend-platform/auth';
import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { COMPLETE_STATE, LOGIN_PAGE } from '../../data/constants';
import { RenderInstitutionButton } from '../InstitutionLogistration';
import Logistration from '../Logistration';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-platform/auth');
analytics.sendPageEvent = jest.fn();

const mockStore = configureStore();
const IntlLogistration = injectIntl(Logistration);

describe('Logistration', () => {
  let store = {};

  const secondaryProviders = {
    id: 'saml-test',
    name: 'Test University',
    loginUrl: '/dummy-auth',
    registerUrl: '/dummy_auth',
  };

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </IntlProvider>
  );

  beforeEach(() => {
    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, username: 'edX' }));
  });
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

  it('should display institution login option when secondary providers are present', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

    store = mockStore({
      login: {
        loginResult: { success: false, redirectUrl: '' },
      },
      commonComponents: {
        thirdPartyAuthContext: {
          currentProvider: null,
          finishAuthUrl: null,
          providers: [],
          secondaryProviders: [secondaryProviders],
        },
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      },
    });

    const props = { selectedPage: LOGIN_PAGE };
    const logistration = mount(reduxWrapper(<IntlLogistration {...props} />));
    expect(logistration.text().includes('Institution/campus credentials')).toBe(true);

    // on clicking "Institution/campus credentials" button, it should display institution login page
    logistration.find(RenderInstitutionButton).simulate('click', { institutionLogin: true });
    expect(logistration.text().includes('Test University')).toBe(true);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('send tracking and page events when institutional login button is clicked', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

    store = mockStore({
      login: {
        loginResult: { success: false, redirectUrl: '' },
      },
      commonComponents: {
        thirdPartyAuthContext: {
          currentProvider: null,
          finishAuthUrl: null,
          providers: [],
          secondaryProviders: [secondaryProviders],
        },
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      },
    });

    const props = { selectedPage: LOGIN_PAGE };
    const logistration = mount(reduxWrapper(<IntlLogistration {...props} />));
    logistration.find(RenderInstitutionButton).simulate('click', { institutionLogin: true });

    expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    expect(analytics.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'institution_login');

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should not display institution register button', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

    store = mockStore({
      register: {
        registrationResult: { success: false, redirectUrl: '' },
        registrationError: {},
      },
      commonComponents: {
        thirdPartyAuthContext: {
          currentProvider: null,
          finishAuthUrl: null,
          providers: [],
          secondaryProviders: [secondaryProviders],
        },
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      },
    });

    delete window.location;
    window.location = { hostname: getConfig().SITE_NAME, href: getConfig().BASE_URL };

    const root = mount(reduxWrapper(<IntlLogistration />));
    root.find(RenderInstitutionButton).simulate('click', { institutionLogin: true });
    expect(root.text().includes('Test University')).toBe(true);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });
});
