import { mergeConfig } from '@edx/frontend-platform';
import {
  configure, getLocale, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { useThirdPartyAuthContext } from '../../../common-components/components/ThirdPartyAuthContext';
import { useFieldValidations, useRegistration } from '../../data/apiHook';
import {
  FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR, TPA_AUTHENTICATION_FAILURE, TPA_SESSION_EXPIRED,
} from '../../data/constants';
import RegistrationPage from '../../RegistrationPage';
import { useRegisterContext } from '../RegisterContext';
import RegistrationFailureMessage from '../RegistrationFailure';

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
jest.mock('../../data/apiHook.ts', () => ({
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
  };
});

describe('RegistrationFailure', () => {
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
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        {children}
      </IntlProvider>
    </QueryClientProvider>
  );

  const routerWrapper = children => (
    <Router>
      {children}
    </Router>
  );

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

  describe('Test Registration Failure', () => {
    getLocale.mockImplementation(() => ('en-us'));

    it('should match internal server error message', () => {
      const expectedMessage = 'We couldn\'t create your account.An error has occurred. Try refreshing the page, or check your internet connection.';
      props = {
        errorCode: INTERNAL_SERVER_ERROR,
        failureCount: 0,
      };

      const { container } = render(renderWrapper(<RegistrationFailureMessage {...props} />));

      const alertHeading = container.querySelectorAll('div.alert-heading');
      expect(alertHeading.length).toEqual(1);

      const alert = container.querySelector('div.alert');
      expect(alert.textContent).toContain(expectedMessage);
    });

    it('should match registration api rate limit error message', () => {
      const expectedMessage = 'We couldn\'t create your account.Too many failed registration attempts. Try again later.';
      props = {
        errorCode: FORBIDDEN_REQUEST,
        failureCount: 0,
      };

      const { container } = render(renderWrapper(<RegistrationFailureMessage {...props} />));

      const alertHeading = container.querySelectorAll('div.alert-heading');
      expect(alertHeading.length).toEqual(1);

      const alert = container.querySelector('div.alert');
      expect(alert.textContent).toContain(expectedMessage);
    });

    it('should match tpa session expired error message', () => {
      const expectedMessage = 'We couldn\'t create your account.Registration using Google has timed out.';
      props = {
        context: {
          provider: 'Google',
        },
        errorCode: TPA_SESSION_EXPIRED,
        failureCount: 0,
      };

      const { container } = render(renderWrapper(<RegistrationFailureMessage {...props} />));

      const alertHeading = container.querySelectorAll('div.alert-heading');
      expect(alertHeading.length).toEqual(1);

      const alert = container.querySelector('div.alert');
      expect(alert.textContent).toContain(expectedMessage);
    });

    it('should match tpa authentication failed error message', () => {
      const expectedMessageSubstring = 'We are sorry, you are not authorized to access';
      props = {
        context: {
          provider: 'Google',
        },
        errorCode: TPA_AUTHENTICATION_FAILURE,
        failureCount: 0,
      };

      const { container } = render(renderWrapper(<RegistrationFailureMessage {...props} />));

      const alertHeading = container.querySelectorAll('div.alert-heading');
      expect(alertHeading.length).toEqual(1);

      const alert = container.querySelector('div.alert');
      expect(alert.textContent).toContain(expectedMessageSubstring);
    });

    it('should display error message based on the error code returned by API', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationError: {
          errorCode: INTERNAL_SERVER_ERROR,
        },
      });

      render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      const validationError = screen.queryByText('An error has occurred. Try refreshing the page, or check your internet connection.');

      expect(validationError).not.toBeNull();
    });
  });
});
