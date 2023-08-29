import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import Logistration from './Logistration';
import { clearThirdPartyAuthContextErrorMessage } from '../common-components/data/actions';
import { RenderInstitutionButton } from '../common-components/InstitutionLogistration';
import {
  COMPLETE_STATE, LOGIN_PAGE,
} from '../data/constants';
import { backupRegistrationForm } from '../register/data/actions';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth');

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

  const initialState = {
    register: {
      registrationFormData: {
        configurableFormFields: {
          marketingEmailsOptIn: true,
        },
        formFields: {
          name: '', email: '', username: '', password: '',
        },
        emailSuggestion: {
          suggestion: '', type: '',
        },
        errors: {
          name: '', email: '', username: '', password: '',
        },
      },
      registrationResult: { success: false, redirectUrl: '' },
      registrationError: {},
      usernameSuggestions: [],
      validationApiRateLimited: false,
    },
    commonComponents: {
      thirdPartyAuthContext: {
        providers: [],
        secondaryProviders: [],
      },
    },
    login: {
      loginResult: { success: false, redirectUrl: '' },
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    jest.mock('@edx/frontend-platform/auth', () => ({
      getAuthenticatedUser: jest.fn(() => ({
        userId: 3,
        username: 'test-user',
      })),
    }));

    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });
  });

  it('should render registration page', () => {
    mergeConfig({
      ALLOW_PUBLIC_ACCOUNT_CREATION: true,
    });

    const logistration = mount(reduxWrapper(<IntlLogistration />));

    expect(logistration.find('#main-content').find('RegistrationPage').exists()).toBeTruthy();
  });

  it('should render login page', () => {
    const props = { selectedPage: LOGIN_PAGE };
    const logistration = mount(reduxWrapper(<IntlLogistration {...props} />));

    expect(logistration.find('#main-content').find('LoginPage').exists()).toBeTruthy();
  });

  it('should render only login page when public account creation is disabled', () => {
    mergeConfig({
      ALLOW_PUBLIC_ACCOUNT_CREATION: false,
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

    store = mockStore({
      ...initialState,
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

    // verifying sign in heading for institution login false
    expect(logistration.find('#main-content').find('h3').text()).toEqual('Sign in');

    // verifying tabs heading for institution login true
    logistration.find(RenderInstitutionButton).simulate('click', { institutionLogin: true });
    expect(logistration.find('#controlled-tab').exists()).toBeTruthy();
  });

  it('should display institution login option when secondary providers are present', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
      ALLOW_PUBLIC_ACCOUNT_CREATION: 'true',
    });

    store = mockStore({
      ...initialState,
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
      ...initialState,
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

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'institution_login');

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should not display institution register button', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

    store = mockStore({
      ...initialState,
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

  it('should fire action to backup registration form on tab click', () => {
    store.dispatch = jest.fn(store.dispatch);
    const logistration = mount(reduxWrapper(<IntlLogistration />));
    logistration.find('a[data-rb-event-key="/login"]').simulate('click');
    expect(store.dispatch).toHaveBeenCalledWith(backupRegistrationForm());
  });

  it('should clear tpa context errorMessage tab click', () => {
    store.dispatch = jest.fn(store.dispatch);
    const logistration = mount(reduxWrapper(<IntlLogistration />));
    logistration.find('a[data-rb-event-key="/login"]').simulate('click');
    expect(store.dispatch).toHaveBeenCalledWith(clearThirdPartyAuthContextErrorMessage());
  });
});
