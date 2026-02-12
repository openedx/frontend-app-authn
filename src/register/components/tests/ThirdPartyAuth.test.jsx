import { getConfig, mergeConfig } from '@edx/frontend-platform';
import {
  configure, getLocale, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { useThirdPartyAuthContext } from '../../../common-components/components/ThirdPartyAuthContext';
import {
  COMPLETE_STATE, LOGIN_PAGE, PENDING_STATE, REGISTER_PAGE,
} from '../../../data/constants';
import { useFieldValidations, useRegistration } from '../../data/apiHook';
import RegistrationPage from '../../RegistrationPage';
import { useRegisterContext } from '../RegisterContext';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

// Mock React Query hooks
jest.mock('../../data/api.hook.ts', () => ({
  useRegistration: jest.fn(),
  useFieldValidations: jest.fn(),
}));
jest.mock('../RegisterContext.tsx', () => ({
  RegisterProvider: ({ children }) => children,
  useRegisterContext: jest.fn(),
}));
jest.mock('../../../common-components/components/ThirdPartyAuthContext.tsx', () => ({
  ThirdPartyAuthProvider: ({ children }) => children,
  useThirdPartyAuthContext: jest.fn(),
}));

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

describe('ThirdPartyAuth', () => {
  mergeConfig({
    PRIVACY_POLICY: 'https://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'https://tos-and-honot-code.com',
    USER_RETENTION_COOKIE_NAME: 'authn-returning-user',
  });

  let props = {};
  let queryClient;
  const registrationFormData = {
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
  };

  const renderWrapper = children => (
    <IntlProvider locale="en">
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </IntlProvider>
  );

  const routerWrapper = children => (
    <Router>
      {children}
    </Router>
  );

  const mockThirdPartyAuthContext = {
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
    clearThirdPartyAuthErrorMessage: jest.fn(),
  };

  const mockRegisterContext = {
    registrationResult: { success: false, redirectUrl: '', authenticatedUser: null },
    registrationError: {},
    registrationFormData,
    usernameSuggestions: [],
    validations: null,
    submitState: 'default',
    userPipelineDataLoaded: false,
    validationApiRateLimited: false,
    shouldBackupState: false,
    backendValidations: null,
    backendCountryCode: '',
    setValidationsSuccess: jest.fn(),
    setValidationsFailure: jest.fn(),
    clearUsernameSuggestions: jest.fn(),
    clearRegistrationBackendError: jest.fn(),
    updateRegistrationFormData: jest.fn(),
    setRegistrationResult: jest.fn(),
    setBackendCountryCode: jest.fn(),
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    // Setup default mocks
    useRegistration.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      error: null,
    });

    useRegisterContext.mockReturnValue(mockRegisterContext);
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);
    useFieldValidations.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      error: null,
    });

    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });
    props = {
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const ssoProvider = {
    id: 'oa2-apple-id',
    name: 'Apple',
    iconClass: 'apple',
    iconImage: 'https://openedx.devstack.lms/logo.png',
    loginUrl: '/auth/login/apple-id/?auth_entry=login&next=/dashboard',
  };

  describe('Test Third Party Auth', () => {
    mergeConfig({
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
    });
    getLocale.mockImplementation(() => ('en-us'));

    const secondaryProviders = {
      id: 'saml-test', name: 'Test University', loginUrl: '/dummy-auth', registerUrl: '/dummy_auth',
    };

    it('should not display password field when current provider is present', () => {
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          currentProvider: ssoProvider.name,
        },
      });

      const { queryByLabelText } = render(
        routerWrapper(renderWrapper(<RegistrationPage {...props} />)),
      );

      const passwordField = queryByLabelText('Password');

      expect(passwordField).toBeNull();
    });

    it('should render tpa button for tpa_hint id matching one of the primary providers', () => {
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          providers: [ssoProvider],
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };

      const { container } = render(
        routerWrapper(renderWrapper(<RegistrationPage {...props} />)),
      );
      const tpaButton = container.querySelector(`button#${ssoProvider.id}`);

      expect(tpaButton).toBeTruthy();
      expect(tpaButton.textContent).toEqual(ssoProvider.name);
      expect(tpaButton.classList.contains('btn-tpa')).toBe(true);
      expect(tpaButton.classList.contains(`btn-${ssoProvider.id}`)).toBe(true);
    });

    it('should display skeleton if tpa_hint is true and thirdPartyAuthContext is pending', () => {
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthApiStatus: PENDING_STATE,
      });

      delete window.location;
      window.location = {
        href: getConfig().BASE_URL.concat(LOGIN_PAGE),
        search: `?next=/dashboard&tpa_hint=${ssoProvider.id}`,
      };

      const { container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      const skeletonElement = container.querySelector('.react-loading-skeleton');

      expect(skeletonElement).toBeTruthy();
    });

    it('should render icon if icon classes are missing in providers', () => {
      ssoProvider.iconClass = null;
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          providers: [ssoProvider],
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };
      ssoProvider.iconImage = null;

      const { container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      const iconElement = container.querySelector(`button#${ssoProvider.id} div span.pgn__icon`);

      expect(iconElement).toBeTruthy();
    });

    it('should render tpa button for tpa_hint id matching one of the secondary providers', () => {
      secondaryProviders.skipHintedLogin = true;
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          secondaryProviders: [secondaryProviders],
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };

      render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      expect(window.location.href).toEqual(getConfig().LMS_BASE_URL + secondaryProviders.registerUrl);
    });

    it('should render regular tpa button for invalid tpa_hint value', () => {
      const expectedMessage = `${ssoProvider.name}`;
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          providers: [ssoProvider],
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: '?next=/dashboard&tpa_hint=invalid' };

      const { container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      const providerButton = container.querySelector(`button#${ssoProvider.id} span#provider-name`);

      expect(providerButton.textContent).toEqual(expectedMessage);
    });

    it('should show single sign on provider button', () => {
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          providers: [ssoProvider],
        },
      });

      const { container } = render(
        routerWrapper(renderWrapper(<RegistrationPage {...props} />)),
      );

      const buttonsWithId = container.querySelectorAll(`button#${ssoProvider.id}`);

      expect(buttonsWithId.length).toEqual(1);
    });

    it('should show single sign on provider button', () => {
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          providers: [ssoProvider],
        },
      });

      const { container } = render(
        routerWrapper(renderWrapper(<RegistrationPage {...props} />)),
      );

      const buttonsWithId = container.querySelectorAll(`button#${ssoProvider.id}`);

      expect(buttonsWithId.length).toEqual(1);
    });

    it('should display InstitutionLogistration if insitutionLogin prop is true', () => {
      props = {
        ...props,
        institutionLogin: true,
      };

      const { getByText } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      const headingElement = getByText('Register with institution/campus credentials');
      expect(headingElement).toBeTruthy();
    });

    it('should redirect to social auth provider url on SSO button click', () => {
      const registerUrl = '/auth/login/apple-id/?auth_entry=register&next=/dashboard';
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          providers: [{
            ...ssoProvider,
            registerUrl,
          }],
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL };

      const { container } = render(
        routerWrapper(renderWrapper(<RegistrationPage {...props} />)),
      );

      const ssoButton = container.querySelector('button#oa2-apple-id');
      fireEvent.click(ssoButton);

      expect(window.location.href).toBe(getConfig().LMS_BASE_URL + registerUrl);
    });

    it('should redirect to finishAuthUrl upon successful registration via SSO', () => {
      const authCompleteUrl = '/auth/complete/google-oauth2/';
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationResult: {
          success: true,
          redirectUrl: '',
          authenticatedUser: null,
        },
      });

      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          finishAuthUrl: authCompleteUrl,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL };

      render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      expect(window.location.href).toBe(getConfig().LMS_BASE_URL + authCompleteUrl);
    });

    // ******** test alert messages ********

    it('should match third party auth alert', () => {
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          currentProvider: 'Apple',
        },
      });

      const expectedMessage = `${'You\'ve successfully signed into Apple! We just need a little more information before '
                              + 'you start learning with '}${ getConfig().SITE_NAME }.`;

      const { container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      const tpaAlert = container.querySelector('#tpa-alert p');
      expect(tpaAlert.textContent).toEqual(expectedMessage);
    });

    it('should display errorMessage if third party authentication fails', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      getLocale.mockImplementation(() => ('en-us'));

      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        backendCountryCode: 'PK',
        userPipelineDataLoaded: false,
      });

      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthApiStatus: COMPLETE_STATE,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          currentProvider: null,
          pipelineUserDetails: {},
          errorMessage: 'An error occurred',
        },
      });

      const { container } = render(
        routerWrapper(renderWrapper(<RegistrationPage {...props} />)),
      );

      const alertHeading = container.querySelector('div.alert-heading');
      expect(alertHeading).toBeTruthy();

      const alert = container.querySelector('div.alert');
      expect(alert.textContent).toContain('An error occurred');
    });
  });
});
