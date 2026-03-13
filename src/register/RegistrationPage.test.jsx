import {
  CurrentAppProvider, getSiteConfig, IntlProvider, mergeAppConfig,
} from '@openedx/frontend-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useRegisterContext } from './components/RegisterContext';
import { useFieldValidations, useRegistration } from './data/apiHook';
import { INTERNAL_SERVER_ERROR } from './data/constants';
import RegistrationPage from './RegistrationPage';
import { useThirdPartyAuthContext } from '../common-components/components/ThirdPartyAuthContext';
import { useThirdPartyAuthHook } from '../common-components/data/apiHook';
import { appId } from '../constants';
import {
  AUTHN_PROGRESSIVE_PROFILING, COMPLETE_STATE, REGISTER_PAGE,
} from '../data/constants';

// Mock React Query hooks
jest.mock('./data/apiHook', () => ({
  useRegistration: jest.fn(),
  useFieldValidations: jest.fn(),
}));

jest.mock('./components/RegisterContext', () => ({
  useRegisterContext: jest.fn(),
  RegisterProvider: ({ children }) => children,
}));

jest.mock('../common-components/components/ThirdPartyAuthContext', () => ({
  useThirdPartyAuthContext: jest.fn(),
  ThirdPartyAuthProvider: ({ children }) => children,
}));

jest.mock('../common-components/data/apiHook', () => ({
  useThirdPartyAuthHook: jest.fn(),
}));

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
  getLocale: jest.fn(),
}));

// jest.mock() must be called before importing the mocked module's members,
// so this import intentionally comes after the mock declaration above.
// eslint-disable-next-line import/first
import { getLocale, sendPageEvent, sendTrackEvent } from '@openedx/frontend-base';

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

jest.mock('../data/utils', () => ({
  ...jest.requireActual('../data/utils'),
  getTpaHint: jest.fn(() => null), // Ensure no tpa hint
}));

describe('RegistrationPage', () => {
  mergeAppConfig(appId, {
    PRIVACY_POLICY: 'https://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'https://tos-and-honot-code.com',
    USER_RETENTION_COOKIE_NAME: 'authn-returning-user',
    SESSION_COOKIE_DOMAIN: '',
  });

  let props = {};
  let queryClient;
  let mockRegistrationMutation;
  let mockRegisterContext;
  let mockThirdPartyAuthContext;
  let mockThirdPartyAuthHook;
  let mockClearRegistrationBackendError;
  let mockUpdateRegistrationFormData;
  let mockSetEmailSuggestionContext;
  let mockBackupRegistrationForm;
  let mockSetUserPipelineDataLoaded;

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

  const renderWrapper = (children) => (
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

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockRegistrationMutation = {
      mutate: jest.fn(),
      isPending: false,
      error: null,
      data: null,
    };
    useRegistration.mockReturnValue(mockRegistrationMutation);
    const mockFieldValidationsMutation = {
      mutate: jest.fn(),
      isPending: false,
      error: null,
      data: null,
    };
    useFieldValidations.mockReturnValue(mockFieldValidationsMutation);
    mockClearRegistrationBackendError = jest.fn();
    mockUpdateRegistrationFormData = jest.fn();
    mockSetEmailSuggestionContext = jest.fn();
    mockBackupRegistrationForm = jest.fn();
    mockSetUserPipelineDataLoaded = jest.fn();
    mockRegisterContext = {
      registrationFormData,
      setRegistrationFormData: jest.fn(),
      errors: {
        name: '', email: '', username: '', password: '',
      },
      setErrors: jest.fn(),
      usernameSuggestions: [],
      validationApiRateLimited: false,
      registrationResult: { success: false, redirectUrl: '', authenticatedUser: null },
      registrationError: {},
      emailSuggestion: { suggestion: '', type: '' },
      validationErrors: {},
      clearRegistrationBackendError: mockClearRegistrationBackendError,
      updateRegistrationFormData: mockUpdateRegistrationFormData,
      setEmailSuggestionContext: mockSetEmailSuggestionContext,
      backupRegistrationForm: mockBackupRegistrationForm,
      setUserPipelineDataLoaded: mockSetUserPipelineDataLoaded,
      setRegistrationResult: jest.fn(),
      setRegistrationError: jest.fn(),
      setBackendCountryCode: jest.fn(),
      backendValidations: null,
      backendCountryCode: '',
      validations: null,
      submitState: 'default',
      userPipelineDataLoaded: false,
      setValidationsSuccess: jest.fn(),
      setValidationsFailure: jest.fn(),
      clearUsernameSuggestions: jest.fn(),
    };
    useRegisterContext.mockReturnValue(mockRegisterContext);

    // Mock the third party auth context
    mockThirdPartyAuthContext = {
      fieldDescriptions: { country: { name: 'country' } },
      optionalFields: { fields: {}, extended_profile: [] },
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        autoSubmitRegForm: false,
        currentProvider: null,
        finishAuthUrl: null,
        pipelineUserDetails: null,
        providers: [],
        secondaryProviders: [],
        errorMessage: null,
      },
      setThirdPartyAuthContextBegin: jest.fn(),
      setThirdPartyAuthContextSuccess: jest.fn(),
      setThirdPartyAuthContextFailure: jest.fn(),
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    mockThirdPartyAuthHook = {
      data: null,
      isSuccess: false,
      error: null,
      isLoading: false,
    };
    jest.mocked(useThirdPartyAuthHook).mockReturnValue(mockThirdPartyAuthHook);

    getLocale.mockImplementation(() => 'en-us');

    props = {
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const populateRequiredFields = (
    getByLabelText,
    payload,
    isThirdPartyAuth = false,
    autoGeneratedUsernameEnabled = false,
  ) => {
    fireEvent.change(getByLabelText('Full name'), { target: { value: payload.name, name: 'name' } });
    if (!autoGeneratedUsernameEnabled) {
      fireEvent.change(getByLabelText('Public username'), { target: { value: payload.username, name: 'username' } });
    }
    fireEvent.change(getByLabelText('Email'), { target: { value: payload.email, name: 'email' } });

    fireEvent.change(getByLabelText('Country/Region'), { target: { value: payload.country, name: 'country' } });
    fireEvent.blur(getByLabelText('Country/Region'), { target: { value: payload.country, name: 'country' } });

    if (!isThirdPartyAuth) {
      fireEvent.change(getByLabelText('Password'), { target: { value: payload.password, name: 'password' } });
    }
  };

  describe('Test Registration Page', () => {
    mergeAppConfig(appId, {
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
      ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
    });

    const emptyFieldValidation = {
      name: 'Enter your full name',
      username: 'Username must be between 2 and 30 characters',
      email: 'Enter your email',
      password: 'Password criteria has not been met',
      country: 'Select your country or region of residence',
    };

    // ******** test registration form submission ********

    it('should submit form for valid input', () => {
      getLocale.mockImplementation(() => ('en-us'));
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      delete window.location;
      window.location = { href: getSiteConfig().baseUrl, search: '?next=/course/demo-course-url' };

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@gmail.com',
        password: 'password1',
        country: 'Pakistan',
        total_registration_time: 0,
      };

      const { getByLabelText, container } = render(renderWrapper(<RegistrationPage {...props} />));
      populateRequiredFields(getByLabelText, payload);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);

      expect(mockRegistrationMutation.mutate).toHaveBeenCalledWith({ ...payload, country: 'PK', next: '/course/demo-course-url' });
    });

    it('should submit form without password field when current provider is present', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      const formPayload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        country: 'Pakistan',
        social_auth_provider: 'Apple',
        total_registration_time: 0,
      };

      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          currentProvider: 'Apple',
        },
      });

      const { getByLabelText, container } = render(renderWrapper(<RegistrationPage {...props} />));

      populateRequiredFields(getByLabelText, formPayload, true);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);
      expect(mockRegistrationMutation.mutate).toHaveBeenCalledWith({ ...formPayload, country: 'PK' });
    });

    it('should display an error when form is submitted with an invalid email', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      const emailError = "We couldn't create your account.Please check your responses and try again.";

      const formPayload = {
        name: 'Petro',
        username: 'petro_qa',
        email: 'petro  @example.com',
        password: 'password1',
        country: 'Ukraine',
        total_registration_time: 0,
      };

      const { getByLabelText, container } = render(renderWrapper(<RegistrationPage {...props} />));
      populateRequiredFields(getByLabelText, formPayload, true);

      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);

      const validationErrors = container.querySelector('#validation-errors');
      expect(validationErrors.textContent).toContain(emailError);
    });

    it('should display an error when form is submitted with an invalid username', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      const usernameError = "We couldn't create your account.Please check your responses and try again.";

      const formPayload = {
        name: 'Petro',
        username: 'petro qa',
        email: 'petro@example.com',
        password: 'password1',
        country: 'Ukraine',
        total_registration_time: 0,
      };

      const { getByLabelText, container } = render(renderWrapper(<RegistrationPage {...props} />));
      populateRequiredFields(getByLabelText, formPayload, true);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);
      const validationErrors = container.querySelector('#validation-errors');
      expect(validationErrors.textContent).toContain(usernameError);
    });

    it('should submit form with marketing email opt in value', () => {
      mergeAppConfig(appId, {
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@gmail.com',
        password: 'password1',
        country: 'Pakistan',
        total_registration_time: 0,
        marketing_emails_opt_in: true,
      };

      const { getByLabelText, container } = render(renderWrapper(<RegistrationPage {...props} />));
      populateRequiredFields(getByLabelText, payload);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);
      expect(mockRegistrationMutation.mutate).toHaveBeenCalledWith({ ...payload, country: 'PK' });

      mergeAppConfig(appId, {
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should submit form without UsernameField when autoGeneratedUsernameEnabled is true', () => {
      mergeAppConfig(appId, {
        ENABLE_AUTO_GENERATED_USERNAME: true,
      });
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      const payload = {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password1',
        country: 'Pakistan',
        total_registration_time: 0,
      };

      const { getByLabelText, container } = render(renderWrapper(<RegistrationPage {...props} />));
      populateRequiredFields(getByLabelText, payload, false, true);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);
      expect(mockRegistrationMutation.mutate).toHaveBeenCalledWith({ ...payload, country: 'PK' });
      mergeAppConfig(appId, {
        ENABLE_AUTO_GENERATED_USERNAME: false,
      });
    });

    it('should not display UsernameField when ENABLE_AUTO_GENERATED_USERNAME is true', () => {
      mergeAppConfig(appId, {
        ENABLE_AUTO_GENERATED_USERNAME: true,
      });

      const { queryByLabelText } = render(renderWrapper(<RegistrationPage {...props} />));
      expect(queryByLabelText('Username')).toBeNull();

      mergeAppConfig(appId, {
        ENABLE_AUTO_GENERATED_USERNAME: false,
      });
    });

    it('should not dispatch registerNewUser on empty form Submission', () => {
      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);

      expect(mockRegistrationMutation.mutate).not.toHaveBeenCalled();
    });

    // ******** test registration form validations ********

    it('should show error messages for required fields on empty form submission', () => {
      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);

      Object.entries(emptyFieldValidation).forEach(([fieldName, validationMessage]) => {
        const feedbackElement = container.querySelector(`div[feedback-for="${fieldName}"]`);
        expect(feedbackElement.textContent).toContain(validationMessage);
      });

      const alertBanner = 'We couldn\'t create your account.Please check your responses and try again.';
      const validationErrors = container.querySelector('#validation-errors');
      expect(validationErrors.textContent).toContain(alertBanner);
    });

    it('should set errors with validations returned by registration api', () => {
      const usernameError = 'It looks like this username is already taken';
      const emailError = `This email is already associated with an existing or previous ${getSiteConfig().siteName} account`;

      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationError: {
          username: [{ userMessage: usernameError }],
          email: [{ userMessage: emailError }],
        },
      });

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const usernameFeedback = container.querySelector('div[feedback-for="username"]');
      const emailFeedback = container.querySelector('div[feedback-for="email"]');

      expect(usernameFeedback).toBeNull();
      expect(emailFeedback).toBeNull();
    });

    it('should clear error on focus', () => {
      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const submitButton = container.querySelector('button.btn-brand');
      fireEvent.click(submitButton);

      const passwordFeedback = container.querySelector('div[feedback-for="password"]');
      expect(passwordFeedback.textContent).toContain(emptyFieldValidation.password);

      const passwordField = container.querySelector('input#password');
      fireEvent.focus(passwordField);

      const isFeedbackPresent = container.contains(passwordFeedback);
      expect(isFeedbackPresent).toBeFalsy();
    });

    it('should clear registration backend error on change', () => {
      const emailError = 'This email is already associated with an existing or previous account';
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationError: {
          email: [{ userMessage: emailError }],
        },
        clearRegistrationBackendError: mockClearRegistrationBackendError,
      });

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.change(emailInput, { target: { value: 'test1@gmail.com', name: 'email' } });
      expect(mockClearRegistrationBackendError).toHaveBeenCalledWith('email');
    });

    // ******** test form buttons and fields ********

    it('should match default button state', () => {
      const { container } = render(renderWrapper(<RegistrationPage {...props} />));
      const button = container.querySelector('button[type="submit"] span');
      expect(button.textContent).toEqual('Create an account for free');
    });

    it('should match pending button state', () => {
      const loadingMutation = {
        ...mockRegistrationMutation,
        isLoading: true,
        isPending: true,
      };
      useRegistration.mockReturnValue(loadingMutation);

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));
      const button = container.querySelector('button[type="submit"]');
      expect(['', 'pending'].includes(button.textContent.trim())).toBe(true);
    });

    it('should display opt-in/opt-out checkbox', () => {
      mergeAppConfig(appId, {
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));
      const checkboxDivs = container.querySelectorAll('div.form-field--checkbox');
      expect(checkboxDivs.length).toEqual(1);

      mergeAppConfig(appId, {
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should show button label based on cta query params value', () => {
      const buttonLabel = 'Register';
      delete window.location;
      window.location = { href: getSiteConfig().baseUrl, search: `?cta=${buttonLabel}` };
      const { container } = render(renderWrapper(<RegistrationPage {...props} />));
      const button = container.querySelector('button[type="submit"] span');

      const buttonText = button.textContent;

      expect(buttonText).toEqual(buttonLabel);
    });

    it('should check user retention cookie', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationResult: {
          success: true,
        },
      });

      render(renderWrapper(<RegistrationPage {...props} />));
      expect(document.cookie).toMatch('authn-returning-user=true');
    });

    it('should redirect to url returned in registration result after successful account creation', () => {
      const dashboardURL = 'https://test.com/testing-dashboard/';
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationResult: {
          success: true,
          redirectUrl: dashboardURL,
        },
      });

      delete window.location;
      window.location = { href: getSiteConfig().baseUrl };
      render(renderWrapper(<RegistrationPage {...props} />));
      expect(window.location.href).toBe(dashboardURL);
    });

    it('should wire up onSuccess callback for registration mutation', () => {
      let registrationOnSuccess = null;
      const successfulMutation = {
        mutate: jest.fn(),
        isPending: false,
        error: null,
        data: null,
      };

      useRegistration.mockImplementation(({ onSuccess }) => {
        registrationOnSuccess = onSuccess;
        return successfulMutation;
      });

      render(renderWrapper(<RegistrationPage {...props} />));

      // Verify the onSuccess callback is wired up
      expect(registrationOnSuccess).not.toBeNull();

      // Call onSuccess and verify it calls context setters
      const mockSetRegistrationResult = mockRegisterContext.setRegistrationResult;
      registrationOnSuccess({ success: true, redirectUrl: 'https://test.com/dashboard', authenticatedUser: null });
      expect(mockSetRegistrationResult).toHaveBeenCalledWith({
        success: true, redirectUrl: 'https://test.com/dashboard', authenticatedUser: null,
      });
    });

    it('should redirect to dashboard if features flags are configured but no optional fields are configured', () => {
      mergeAppConfig(appId, {
        ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: true,
      });
      const dashboardUrl = 'https://test.com/testing-dashboard/';

      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationResult: {
          success: true,
          redirectUrl: dashboardUrl,
        },
      });
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        optionalFields: {
          fields: {},
        },
      });

      delete window.location;
      window.location = { href: getSiteConfig().baseUrl };

      render(renderWrapper(<RegistrationPage {...props} />));
      expect(window.location.href).toBe(dashboardUrl);
    });

    it('should redirect to progressive profiling page if optional fields are configured', () => {
      getLocale.mockImplementation(() => ('en-us'));
      mergeAppConfig(appId, {
        ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: true,
      });

      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationResult: {
          success: true,
        },
      });

      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        optionalFields: {
          extended_profile: [],
          fields: {
            level_of_education: { name: 'level_of_education', error_message: false },
          },
        },
      });

      render(renderWrapper(<RegistrationPage {...props} />));
      expect(document.cookie).toMatch('authn-returning-user=true');
    });

    // ******** miscellaneous tests ********

    it('should send page event when register page is rendered', () => {
      render(renderWrapper(<RegistrationPage {...props} />));
      expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'register');
    });

    it('should send track event when user has successfully registered', () => {
      // Mock successful registration result
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationResult: {
          success: true,
          redirectUrl: 'https://test.com/testing-dashboard/',
        },
      });

      delete window.location;
      window.location = { href: getSiteConfig().baseUrl };
      render(renderWrapper(<RegistrationPage {...props} />));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.account.registered.client', {});
    });

    it('should prevent default on mouseDown event for registration button', () => {
      const { container } = render(renderWrapper(<RegistrationPage {...props} />));
      const registerButton = container.querySelector('button.register-button');

      const preventDefaultSpy = jest.fn();
      const event = new Event('mousedown', { bubbles: true });
      event.preventDefault = preventDefaultSpy;

      registerButton.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call internal state setters on successful registration', () => {
      const mockResponse = {
        success: true,
        redirectUrl: 'https://test.com/dashboard',
        authenticatedUser: { username: 'testuser' },
      };

      let registrationOnSuccess = null;
      const successfulMutation = {
        mutate: jest.fn(),
        isPending: false,
        error: null,
        data: null,
      };

      useRegistration.mockImplementation(({ onSuccess }) => {
        registrationOnSuccess = onSuccess;
        return successfulMutation;
      });

      render(renderWrapper(<RegistrationPage {...props} />));
      expect(registrationOnSuccess).not.toBeNull();

      registrationOnSuccess(mockResponse);
      expect(mockRegisterContext.setRegistrationResult).toHaveBeenCalledWith(mockResponse);
    });

    it('should call setThirdPartyAuthContextSuccess and setBackendCountryCode on successful third party auth', async () => {
      const mockSetThirdPartyAuthContextSuccess = jest.fn();
      const mockSetBackendCountryCode = jest.fn();
      jest.spyOn(global.Date, 'now').mockImplementation(() => 1000);

      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        setThirdPartyAuthContextSuccess: mockSetThirdPartyAuthContextSuccess,
      });

      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        setBackendCountryCode: mockSetBackendCountryCode,
      });

      useThirdPartyAuthHook.mockReturnValue({
        data: {
          fieldDescriptions: {},
          optionalFields: { fields: {}, extended_profile: [] },
          thirdPartyAuthContext: { countryCode: 'US' },
        },
        isSuccess: true,
        error: null,
      });

      render(renderWrapper(<RegistrationPage {...props} />));
      await waitFor(() => {
        expect(mockSetThirdPartyAuthContextSuccess).toHaveBeenCalledWith(
          {},
          { fields: {}, extended_profile: [] },
          { countryCode: 'US' },
        );
        expect(mockSetBackendCountryCode).toHaveBeenCalledWith('US');
      });
    });

    it('should populate form with pipeline user details', () => {
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          pipelineUserDetails: {
            email: 'test@example.com',
            username: 'test',
          },
        },
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      });

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const emailInput = container.querySelector('input#email');
      const usernameInput = container.querySelector('input#username');
      expect(emailInput.value).toEqual('test@example.com');
      expect(usernameInput.value).toEqual('test');
    });

    it('should display error message based on the error code returned by API', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationError: {
          errorCode: INTERNAL_SERVER_ERROR,
        },
      });

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));
      const validationErrors = container.querySelector('div#validation-errors');
      expect(validationErrors.textContent).toContain(
        'An error has occurred. Try refreshing the page, or check your internet connection.',
      );
    });

    it('should update form fields state if updated', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationFormData: {
          ...registrationFormData,
          formFields: {
            name: 'John Doe',
            username: 'john_doe',
            email: 'john.doe@yopmail.com',
            password: 'password1',
          },
          emailSuggestion: {
            suggestion: 'john.doe@hotmail.com', type: 'warning',
          },
        },
      });

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const fullNameInput = container.querySelector('input#name');
      const usernameInput = container.querySelector('input#username');
      const emailInput = container.querySelector('input#email');
      const passwordInput = container.querySelector('input#password');
      const emailSuggestion = container.querySelector('.email-suggestion-alert-warning');

      expect(fullNameInput.value).toEqual('John Doe');
      expect(usernameInput.value).toEqual('john_doe');
      expect(emailInput.value).toEqual('john.doe@yopmail.com');
      expect(passwordInput.value).toEqual('password1');
      expect(emailSuggestion.textContent).toEqual('john.doe@hotmail.com');
    });

    // ********* Embedded experience tests *********/

    it('should call the postMessage API when embedded variant is rendered', () => {
      getLocale.mockImplementation(() => ('en-us'));
      mergeAppConfig(appId, {
        ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: true,
      });

      window.parent.postMessage = jest.fn();

      delete window.location;
      window.location = { href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING), search: '?host=http://localhost/host-website' };

      // Mock successful registration result
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationResult: {
          success: true,
        },
      });
      // Mock third party auth context with optional fields
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        optionalFields: {
          extended_profile: {},
          fields: {
            level_of_education: { name: 'level_of_education', error_message: false },
          },
        },
      });
      render(renderWrapper(<RegistrationPage {...props} />));
      expect(window.parent.postMessage).toHaveBeenCalledTimes(2);
    });

    it('should not display validations error on blur event when embedded variant is rendered', () => {
      delete window.location;
      window.location = { href: getSiteConfig().baseUrl.concat(REGISTER_PAGE), search: '?host=http://localhost/host-website' };
      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const usernameInput = container.querySelector('input#username');
      fireEvent.blur(usernameInput, { target: { value: '', name: 'username' } });
      expect(container.querySelector('div[feedback-for="username"]')).toBeFalsy();

      const countryInput = container.querySelector('input[name="country"]');
      fireEvent.blur(countryInput, { target: { value: '', name: 'country' } });
      expect(container.querySelector('div[feedback-for="country"]')).toBeFalsy();
    });

    it('should set errors in temporary state when validations are returned by registration api', () => {
      delete window.location;
      window.location = { href: getSiteConfig().baseUrl.concat(REGISTER_PAGE), search: '?host=http://localhost/host-website' };

      const usernameError = 'It looks like this username is already taken';
      const emailError = 'This email is already associated with an existing or previous account';
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationError: {
          username: [{ userMessage: usernameError }],
          email: [{ userMessage: emailError }],
        },
      });

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));

      const usernameFeedback = container.querySelector('div[feedback-for="username"]');
      const emailFeedback = container.querySelector('div[feedback-for="email"]');

      expect(usernameFeedback).toBeNull();
      expect(emailFeedback).toBeNull();
    });

    it('should clear error on focus for embedded experience also', () => {
      delete window.location;
      window.location = {
        href: getSiteConfig().baseUrl.concat(REGISTER_PAGE),
        search: '?host=http://localhost/host-website',
      };

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));
      const submitButton = container.querySelector('button.btn-brand');
      fireEvent.click(submitButton);

      const passwordFeedback = container.querySelector('div[feedback-for="password"]');
      expect(passwordFeedback.textContent).toContain(emptyFieldValidation.password);

      const passwordField = container.querySelector('input#password');
      fireEvent.focus(passwordField);

      const updatedPasswordFeedback = container.querySelector('div[feedback-for="password"]');
      expect(updatedPasswordFeedback).toBeNull();
    });

    it('should show spinner instead of form while registering if autoSubmitRegForm is true', async () => {
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
          pipelineUserDetails: null,
          autoSubmitRegForm: true,
          errorMessage: null,
        },
      });

      const { container } = render(renderWrapper(<RegistrationPage {...props} />));
      await waitFor(() => {
        const spinnerElement = container.querySelector('#tpa-spinner');
        expect(spinnerElement).toBeTruthy();
      });

      const registrationFormElement = container.querySelector('#registration-form');
      expect(registrationFormElement).toBeFalsy();
    });

    it('should auto register if autoSubmitRegForm is true and pipeline details are loaded', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      getLocale.mockImplementation(() => ('en-us'));

      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        backendCountryCode: 'PK',
        userPipelineDataLoaded: true,
        registrationFormData: {
          ...registrationFormData,
          formFields: {
            name: 'John Doe',
            username: 'john_doe',
            email: 'john.doe@example.com',
            password: '', // Ensure password field is always defined
          },
          configurableFormFields: {
            marketingEmailsOptIn: true,
            country: {
              countryCode: 'PK',
              displayValue: 'Pakistan',
            },
          },
        },
      });

      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        thirdPartyAuthApiStatus: COMPLETE_STATE,
        thirdPartyAuthContext: {
          ...mockThirdPartyAuthContext.thirdPartyAuthContext,
          currentProvider: 'Apple',
          pipelineUserDetails: {
            name: 'John Doe',
            username: 'john_doe',
            email: 'john.doe@example.com',
          },
          autoSubmitRegForm: true,
        },
      });

      render(renderWrapper(<RegistrationPage {...props} />));
      expect(mockRegistrationMutation.mutate).toHaveBeenCalledWith({
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        country: 'PK',
        social_auth_provider: 'Apple',
        total_registration_time: 0,
      });
    });
  });
});
