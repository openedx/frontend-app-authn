import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import Logistration from './Logistration';
import { clearThirdPartyAuthContextErrorMessage } from '../common-components/data/actions';
import {
  COMPLETE_STATE, LOGIN_PAGE, REGISTER_PAGE,
} from '../data/constants';
import { backupLoginForm } from '../login/data/actions';
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

  it('should do nothing when user clicks on the same tab (login/register) again', () => {
    const { container } = render(reduxWrapper(<IntlLogistration />));
    // While staying on the registration form, clicking the register tab again
    fireEvent.click(container.querySelector('a[data-rb-event-key="/register"]'));

    expect(sendTrackEvent).not.toHaveBeenCalledWith('edx.bi.register_form.toggled', { category: 'user-engagement' });
  });

  it('should render registration page', () => {
    mergeConfig({
      ALLOW_PUBLIC_ACCOUNT_CREATION: true,
    });

    const { container } = render(reduxWrapper(<IntlLogistration />));

    expect(container.querySelector('RegistrationPage')).toBeDefined();
  });

  it('should render login page', () => {
    const props = { selectedPage: LOGIN_PAGE };
    const { container } = render(reduxWrapper(<IntlLogistration {...props} />));

    expect(container.querySelector('LoginPage')).toBeDefined();
  });

  it('should render login/register headings when show registration links is disabled', () => {
    mergeConfig({
      SHOW_REGISTRATION_LINKS: false,
    });

    let props = { selectedPage: LOGIN_PAGE };
    const { rerender } = render(reduxWrapper(<IntlLogistration {...props} />));

    // verifying sign in heading
    expect(screen.getByRole('heading', { level: 3 }).textContent).toEqual('Sign in');

    // register page is still accessible when SHOW_REGISTRATION_LINKS is false
    // but it needs to be accessed directly
    props = { selectedPage: REGISTER_PAGE };
    rerender(reduxWrapper(<IntlLogistration {...props} />));

    // verifying register heading
    expect(screen.getByRole('heading', { level: 3 }).textContent).toEqual('Register');
  });

  it('should render only login page when public account creation is disabled', () => {
    mergeConfig({
      ALLOW_PUBLIC_ACCOUNT_CREATION: false,
      DISABLE_ENTERPRISE_LOGIN: 'true',
      SHOW_REGISTRATION_LINKS: 'true',
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
    const { container } = render(reduxWrapper(<IntlLogistration {...props} />));

    // verifying sign in heading for institution login false
    expect(screen.getByRole('heading', { level: 3 }).textContent).toEqual('Sign in');

    // verifying tabs heading for institution login true
    fireEvent.click(screen.getByRole('link'));
    expect(container.querySelector('#controlled-tab')).toBeDefined();
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
    render(reduxWrapper(<IntlLogistration {...props} />));
    expect(screen.getByText('Institution/campus credentials')).toBeDefined();

    // on clicking "Institution/campus credentials" button, it should display institution login page
    fireEvent.click(screen.getByText('Institution/campus credentials'));
    expect(screen.getByText('Test University')).toBeDefined();

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
    render(reduxWrapper(<IntlLogistration {...props} />));
    fireEvent.click(screen.getByText('Institution/campus credentials'));

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

    render(reduxWrapper(<IntlLogistration />));
    fireEvent.click(screen.getByText('Institution/campus credentials'));
    expect(screen.getByText('Test University')).toBeDefined();

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should fire action to backup registration form on tab click', () => {
    store.dispatch = jest.fn(store.dispatch);
    const { container } = render(reduxWrapper(<IntlLogistration />));
    fireEvent.click(container.querySelector('a[data-rb-event-key="/login"]'));
    expect(store.dispatch).toHaveBeenCalledWith(backupRegistrationForm());
  });

  it('should fire action to backup login form on tab click', () => {
    store.dispatch = jest.fn(store.dispatch);
    const props = { selectedPage: LOGIN_PAGE };
    const { container } = render(reduxWrapper(<IntlLogistration {...props} />));
    fireEvent.click(container.querySelector('a[data-rb-event-key="/register"]'));
    expect(store.dispatch).toHaveBeenCalledWith(backupLoginForm());
  });

  it('should clear tpa context errorMessage tab click', () => {
    store.dispatch = jest.fn(store.dispatch);
    const { container } = render(reduxWrapper(<IntlLogistration />));
    fireEvent.click(container.querySelector('a[data-rb-event-key="/login"]'));
    expect(store.dispatch).toHaveBeenCalledWith(clearThirdPartyAuthContextErrorMessage());
  });
});
