import {
  CurrentAppProvider, configureI18n, getSiteConfig, IntlProvider, mergeAppConfig, sendPageEvent, sendTrackEvent
} from '@openedx/frontend-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { appId } from '../constants';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import Logistration from './Logistration';

// Mock the navigate function
const mockNavigate = jest.fn();
const mockGetCsrfToken = jest.fn();

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
  getAuthenticatedUser: jest.fn(() => ({
    userId: 3,
    username: 'test-user',
  })),
  getAuthService: jest.fn(() => ({
    getCsrfTokenService: () => ({
      getCsrfToken: mockGetCsrfToken,
    }),
  })),
}));

// Mock the apiHook to prevent actual API calls
jest.mock('../common-components/data/apiHook', () => ({
  useThirdPartyAuthHook: jest.fn(() => ({
    data: null,
    isSuccess: false,
    error: null,
  })),
}));

// Mock the register apiHook to prevent actual mutations
jest.mock('../register/data/apiHook', () => ({
  useRegistration: () => ({ mutate: jest.fn(), isPending: false }),
  useFieldValidations: () => ({ mutate: jest.fn(), isPending: false }),
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
      providers: [],
      secondaryProviders: [],
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
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return (
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en">
          <MemoryRouter>
            <CurrentAppProvider appId={appId}>
              {children}
            </CurrentAppProvider>
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockGetCsrfToken.mockClear();

    configureI18n({
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });
  });

  it('should do nothing when user clicks on the same tab (login/register) again', () => {
    mergeAppConfig(appId, {
      ALLOW_PUBLIC_ACCOUNT_CREATION: true,
      SHOW_REGISTRATION_LINKS: true,
    });

    const { container } = render(renderWrapper(<Logistration selectedPage={REGISTER_PAGE} />));
    // While staying on the registration form, clicking the register tab again
    fireEvent.click(container.querySelector('a[data-rb-event-key="/register"]'));

    expect(sendTrackEvent).not.toHaveBeenCalled();
  });

  it('should render registration page', () => {
    mergeAppConfig(appId, {
      ALLOW_PUBLIC_ACCOUNT_CREATION: true,
    });

    const { container } = render(renderWrapper(<Logistration selectedPage={REGISTER_PAGE} />));

    expect(container.querySelector('RegistrationPage')).toBeDefined();
  });

  it('should render login page', () => {
    const props = { selectedPage: LOGIN_PAGE };
    const { container } = render(renderWrapper(<Logistration {...props} />));

    expect(container.querySelector('LoginPage')).toBeDefined();
  });

  it('should render login/register headings when show registration links is disabled', () => {
    mergeAppConfig(appId, {
      ALLOW_PUBLIC_ACCOUNT_CREATION: true,
      SHOW_REGISTRATION_LINKS: false,
    });

    let props = { selectedPage: LOGIN_PAGE };
    const { rerender } = render(renderWrapper(<Logistration {...props} />));

    // verifying sign in heading
    expect(screen.getByRole('heading', { level: 3 }).textContent).toEqual('Sign in');

    // register page is still accessible when SHOW_REGISTRATION_LINKS is false
    // but it needs to be accessed directly
    props = { selectedPage: REGISTER_PAGE };
    rerender(renderWrapper(<Logistration {...props} />));

    // verifying register heading
    expect(screen.getByRole('heading', { level: 3 }).textContent).toEqual('Register');
  });

  it('should render only login page when public account creation is disabled', () => {
    mergeAppConfig(appId, {
      ALLOW_PUBLIC_ACCOUNT_CREATION: false,
      DISABLE_ENTERPRISE_LOGIN: 'true',
      SHOW_REGISTRATION_LINKS: 'true',
    });

    const props = { selectedPage: LOGIN_PAGE };
    const { container } = render(renderWrapper(<Logistration {...props} />));

    // verifying sign in heading for institution login false
    expect(screen.getByRole('heading', { level: 3 }).textContent).toEqual('Sign in');

    // verifying tabs heading for institution login true
    fireEvent.click(screen.getByRole('link'));
    expect(container.querySelector('#controlled-tab')).toBeDefined();
  });

  it('should display institution login option when secondary providers are present', () => {
    mergeAppConfig(appId, {
      DISABLE_ENTERPRISE_LOGIN: 'true',
      ALLOW_PUBLIC_ACCOUNT_CREATION: 'true',
    });

    // Update the mock to include secondary providers
    const { useThirdPartyAuthContext } = require('../common-components/components/ThirdPartyAuthContext.tsx');
    useThirdPartyAuthContext.mockReturnValue({
      fieldDescriptions: {},
      optionalFields: { fields: {}, extended_profile: [] },
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        autoSubmitRegForm: false,
        currentProvider: null,
        finishAuthUrl: null,
        countryCode: null,
        providers: [],
        secondaryProviders: [{
          id: 'saml-test',
          name: 'Test University',
          loginUrl: '/dummy-auth',
          registerUrl: '/dummy_auth',
        }],
        pipelineUserDetails: null,
        errorMessage: null,
        welcomePageRedirectUrl: null,
      },
      setThirdPartyAuthContextBegin: jest.fn(),
      setThirdPartyAuthContextSuccess: jest.fn(),
      setThirdPartyAuthContextFailure: jest.fn(),
      clearThirdPartyAuthErrorMessage: mockClearThirdPartyAuthErrorMessage,
    });

    const props = { selectedPage: LOGIN_PAGE };
    render(renderWrapper(<Logistration {...props} />));
    expect(screen.getByText('Institution/campus credentials')).toBeDefined();

    // on clicking "Institution/campus credentials" button, it should display institution login page
    fireEvent.click(screen.getByText('Institution/campus credentials'));
    expect(screen.getByText('Test University')).toBeDefined();

    mergeAppConfig(appId, {
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('send tracking and page events when institutional login button is clicked', () => {
    mergeAppConfig(appId, {
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

    const { useThirdPartyAuthContext } = require('../common-components/components/ThirdPartyAuthContext.tsx');
    useThirdPartyAuthContext.mockReturnValue({
      fieldDescriptions: {},
      optionalFields: { fields: {}, extended_profile: [] },
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        autoSubmitRegForm: false,
        currentProvider: null,
        finishAuthUrl: null,
        countryCode: null,
        providers: [],
        secondaryProviders: [{
          id: 'saml-test',
          name: 'Test University',
          loginUrl: '/dummy-auth',
          registerUrl: '/dummy_auth',
        }],
        pipelineUserDetails: null,
        errorMessage: null,
        welcomePageRedirectUrl: null,
      },
      setThirdPartyAuthContextBegin: jest.fn(),
      setThirdPartyAuthContextSuccess: jest.fn(),
      setThirdPartyAuthContextFailure: jest.fn(),
      clearThirdPartyAuthErrorMessage: mockClearThirdPartyAuthErrorMessage,
    });

    const props = { selectedPage: LOGIN_PAGE };
    render(renderWrapper(<Logistration {...props} />));
    fireEvent.click(screen.getByText('Institution/campus credentials'));

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'institution_login');

    mergeAppConfig(appId, {
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should not display institution register button', () => {
    mergeAppConfig(appId, {
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

    const { useThirdPartyAuthContext } = require('../common-components/components/ThirdPartyAuthContext.tsx');
    useThirdPartyAuthContext.mockReturnValue({
      fieldDescriptions: {},
      optionalFields: { fields: {}, extended_profile: [] },
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        autoSubmitRegForm: false,
        currentProvider: null,
        finishAuthUrl: null,
        countryCode: null,
        providers: [],
        secondaryProviders: [{
          id: 'saml-test',
          name: 'Test University',
          loginUrl: '/dummy-auth',
          registerUrl: '/dummy_auth',
        }],
        pipelineUserDetails: null,
        errorMessage: null,
        welcomePageRedirectUrl: null,
      },
      setThirdPartyAuthContextBegin: jest.fn(),
      setThirdPartyAuthContextSuccess: jest.fn(),
      setThirdPartyAuthContextFailure: jest.fn(),
      clearThirdPartyAuthErrorMessage: mockClearThirdPartyAuthErrorMessage,
    });

    delete window.location;
    window.location = { hostname: getSiteConfig().siteName, href: getSiteConfig().baseUrl };

    render(renderWrapper(<Logistration selectedPage={REGISTER_PAGE} />));
    fireEvent.click(screen.getByText('Institution/campus credentials'));
    expect(screen.getByText('Test University')).toBeDefined();

    mergeAppConfig(appId, {
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should switch to login tab when login tab is clicked', () => {
    const { container } = render(renderWrapper(<Logistration selectedPage={REGISTER_PAGE} />));
    fireEvent.click(container.querySelector('a[data-rb-event-key="/login"]'));
    // Verify the tab switch occurred
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.login_form.toggled', { category: 'user-engagement' });
  });

  it('should switch to register tab when register tab is clicked', () => {
    const props = { selectedPage: LOGIN_PAGE };
    const { container } = render(renderWrapper(<Logistration {...props} />));
    fireEvent.click(container.querySelector('a[data-rb-event-key="/register"]'));
    // Verify the tab switch occurred
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.register_form.toggled', { category: 'user-engagement' });
  });

  it('should clear tpa context errorMessage tab click', () => {
    const { container } = render(renderWrapper(<Logistration selectedPage={REGISTER_PAGE} />));

    fireEvent.click(container.querySelector('a[data-rb-event-key="/login"]'));
    expect(mockClearThirdPartyAuthErrorMessage).toHaveBeenCalled();
  });
});
