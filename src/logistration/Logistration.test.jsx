import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { configure, IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Logistration from './Logistration';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => ({
    ALLOW_PUBLIC_ACCOUNT_CREATION: 'true',
    DISABLE_ENTERPRISE_LOGIN: 'true',
    SHOW_REGISTRATION_LINKS: 'true',
    PROVIDERS: [],
    SECONDARY_PROVIDERS: [{
      id: 'saml-test_university',
      name: 'Test University',
      iconClass: 'fa-university',
      iconImage: null,
      loginUrl: '/auth/login/saml-test_university/?auth_entry=login&next=%2Fdashboard',
      registerUrl: '/auth/login/saml-test_university/?auth_entry=register&next=%2Fdashboard',
    }],
    TPA_HINT: '',
    TPA_PROVIDER_ID: '',
  })),
}));

// Mock the apiHook to prevent logging errors
jest.mock('../common-components/data/apiHook', () => ({
  useLoginMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useThirdPartyAuthMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useThirdPartyAuthHook: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  })),
}));

const secondaryProviders = {
  id: 'saml-test_university',
  name: 'Test University',
  iconClass: 'fa-university',
  iconImage: null,
  loginUrl: '/auth/login/saml-test_university/?auth_entry=login&next=%2Fdashboard',
  registerUrl: '/auth/login/saml-test_university/?auth_entry=register&next=%2Fdashboard',
};

// Mock the action creators since we're not using Redux
jest.mock('../common-components/data/actions', () => ({
  clearThirdPartyAuthContextErrorMessage: jest.fn(() => ({ type: 'CLEAR_TPA_ERROR_MESSAGE' })),
}));

// Mock the ThirdPartyAuthContext
const mockClearThirdPartyAuthErrorMessage = jest.fn();

jest.mock('../common-components/components/ThirdPartyAuthContext.tsx', () => ({
  useThirdPartyAuthContext: jest.fn(() => ({
    fieldDescriptions: {},
    optionalFields: {
      fields: {},
      extended_profile: [],
    },
    thirdPartyAuthApiStatus: null,
    thirdPartyAuthContext: {
      autoSubmitRegForm: false,
      currentProvider: null,
      finishAuthUrl: null,
      countryCode: null,
      providers: [{
        id: 'oa2-facebook',
        name: 'Facebook',
        iconClass: 'fa-facebook',
        iconImage: null,
        skipHintedLogin: false,
        skipRegistrationForm: false,
        loginUrl: '/auth/login/facebook-oauth2/?auth_entry=login&next=%2Fdashboard',
        registerUrl: '/auth/login/facebook-oauth2/?auth_entry=register&next=%2Fdashboard',
      }],
      secondaryProviders: [{
        id: 'saml-test',
        name: 'Test University',
        iconClass: 'fa-sign-in',
        iconImage: null,
        skipHintedLogin: false,
        skipRegistrationForm: false,
        loginUrl: '/auth/login/tpa-saml/?auth_entry=login&next=%2Fdashboard',
        registerUrl: '/auth/login/tpa-saml/?auth_entry=register&next=%2Fdashboard',
      }],
      pipelineUserDetails: null,
      errorMessage: null,
      welcomePageRedirectUrl: null,
    },
    setThirdPartyAuthContextBegin: jest.fn(),
    setThirdPartyAuthContextSuccess: jest.fn(),
    setThirdPartyAuthContextFailure: jest.fn(),
    clearThirdPartyAuthErrorMessage: mockClearThirdPartyAuthErrorMessage,
  })),
  ThirdPartyAuthProvider: ({ children }) => children,
}));

let queryClient;

describe('Logistration', () => {
  const renderWrapper = (children) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    return (
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en">
          <MemoryRouter>
            {children}
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    // Avoid jest open handle error
    jest.clearAllMocks();

    // Configure i18n for testing
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });

    // Set up default configuration for tests
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
      ALLOW_PUBLIC_ACCOUNT_CREATION: 'true',
      SHOW_REGISTRATION_LINKS: 'true',
      TPA_HINT: '',
      TPA_PROVIDER_ID: '',
      THIRD_PARTY_AUTH_HINT: '',
      PROVIDERS: [secondaryProviders],
      SECONDARY_PROVIDERS: [secondaryProviders],
      CURRENT_PROVIDER: null,
      FINISHED_AUTH_PROVIDERS: [],
      DISABLE_TPA_ON_FORM: false,
    });
  });

  it('should do nothing when user clicks on the same tab (login/register) again', () => {
    const { container } = render(renderWrapper(<Logistration selectedPage={REGISTER_PAGE} />));
    // While staying on the registration form, clicking the register tab again
    fireEvent.click(container.querySelector('a[data-rb-event-key="/register"]'));

    expect(sendTrackEvent).not.toHaveBeenCalledWith('edx.bi.register_form.toggled', { category: 'user-engagement' });
  });

  it('should render registration page', () => {
    mergeConfig({
      ALLOW_PUBLIC_ACCOUNT_CREATION: true,
    });

    const { container } = render(renderWrapper(<Logistration />));

    expect(container.querySelector('RegistrationPage')).toBeDefined();
  });

  it('should render login page', () => {
    const props = { selectedPage: LOGIN_PAGE };
    const { container } = render(renderWrapper(<Logistration {...props} />));

    expect(container.querySelector('LoginPage')).toBeDefined();
  });

  it('should render login/register headings when show registration links is disabled', () => {
    mergeConfig({
      SHOW_REGISTRATION_LINKS: false,
    });

    let props = { selectedPage: LOGIN_PAGE };
    const { rerender } = render(renderWrapper(<Logistration {...props} />));

    // verifying sign in tab
    expect(screen.getByRole('tab', { name: 'Sign in' })).toBeDefined();

    // register page is still accessible when SHOW_REGISTRATION_LINKS is false
    // but it needs to be accessed directly
    props = { selectedPage: REGISTER_PAGE };
    rerender(renderWrapper(<Logistration {...props} />));

    // verifying register button
    expect(screen.getByRole('button', { name: 'Create an account for free' })).toBeDefined();
  });

  it('should render only login page when public account creation is disabled', () => {
    mergeConfig({
      ALLOW_PUBLIC_ACCOUNT_CREATION: false,
      DISABLE_ENTERPRISE_LOGIN: 'true',
      SHOW_REGISTRATION_LINKS: 'true',
    });

    const props = { selectedPage: LOGIN_PAGE };
    const { container } = render(renderWrapper(<Logistration {...props} />));

    // verifying sign in tab for institution login false
    expect(screen.getByRole('tab', { name: 'Sign in' })).toBeDefined();

    // verifying tabs heading for institution login true
    fireEvent.click(screen.getByRole('link'));
    expect(container.querySelector('#controlled-tab')).toBeDefined();
  });

  it('should display institution login option when secondary providers are present', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
      ALLOW_PUBLIC_ACCOUNT_CREATION: 'true',
    });

    const props = { selectedPage: LOGIN_PAGE };
    render(renderWrapper(<Logistration {...props} />));
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

    const props = { selectedPage: LOGIN_PAGE };
    render(renderWrapper(<Logistration {...props} />));
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

    delete window.location;
    window.location = { hostname: getConfig().SITE_NAME, href: getConfig().BASE_URL };

    render(renderWrapper(<Logistration />));
    fireEvent.click(screen.getByText('Institution/campus credentials'));
    expect(screen.getByText('Test University')).toBeDefined();

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should switch to login tab when login tab is clicked', () => {
    const { container } = render(renderWrapper(<Logistration />));
    fireEvent.click(container.querySelector('a[data-rb-event-key="/login"]'));
    // Verify the tab switch occurred - check for active login tab
    expect(container.querySelector('a[data-rb-event-key="/login"].active')).toBeTruthy();
  });

  it('should switch to register tab when register tab is clicked', () => {
    const props = { selectedPage: LOGIN_PAGE };
    const { container } = render(renderWrapper(<Logistration {...props} />));
    fireEvent.click(container.querySelector('a[data-rb-event-key="/register"]'));
    // Verify the tab switch occurred - check for active register tab
    expect(container.querySelector('a[data-rb-event-key="/register"].active')).toBeTruthy();
  });

  it('should clear tpa context errorMessage tab click', () => {
    const { container } = render(renderWrapper(<Logistration />));

    fireEvent.click(container.querySelector('a[data-rb-event-key="/login"]'));
    // Verify the TPA context error clearing function was called
    expect(mockClearThirdPartyAuthErrorMessage).toHaveBeenCalled();
  });
});
