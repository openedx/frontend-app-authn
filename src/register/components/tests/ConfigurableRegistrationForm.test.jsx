import { mergeConfig } from '@edx/frontend-platform';
import {
  getLocale, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { useThirdPartyAuthContext } from '../../../common-components/components/ThirdPartyAuthContext';
import { useFieldValidations, useRegistration } from '../../data/apiHook';
import { FIELDS } from '../../data/constants';
import RegistrationPage from '../../RegistrationPage';
import ConfigurableRegistrationForm from '../ConfigurableRegistrationForm';
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
    mockNavigate: mockNavigation,
  };
});

describe('ConfigurableRegistrationForm', () => {
  mergeConfig({
    PRIVACY_POLICY: 'https://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'https://tos-and-honot-code.com',
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
    setUserPipelineDataLoaded: jest.fn(),
    setRegistrationError: jest.fn(),
    setEmailSuggestionContext: jest.fn(),
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
    setEmailSuggestionContext: jest.fn(),
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
    props = {
      email: '',
      fieldDescriptions: {},
      fieldErrors: {},
      formFields: {},
      setFieldErrors: jest.fn(),
      setFormFields: jest.fn(),
      registrationEmbedded: false,
      autoSubmitRegistrationForm: false,
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
    window.location = { search: '' };
    getLocale.mockImplementationOnce(() => ('en-us'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const populateRequiredFields = (getByLabelText, payload, isThirdPartyAuth = false) => {
    fireEvent.change(getByLabelText('Full name'), { target: { value: payload.name, name: 'name' } });
    fireEvent.change(getByLabelText('Public username'), { target: { value: payload.username, name: 'username' } });
    fireEvent.change(getByLabelText('Email'), { target: { value: payload.email, name: 'email' } });

    fireEvent.change(getByLabelText('Country/Region'), { target: { value: payload.country, name: 'country' } });
    fireEvent.blur(getByLabelText('Country/Region'), { target: { value: payload.country, name: 'country' } });

    if (!isThirdPartyAuth) {
      fireEvent.change(getByLabelText('Password'), { target: { value: payload.password, name: 'password' } });
    }
  };

  describe('Test Configurable Fields', () => {
    mergeConfig({
      ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
    });

    it('should render fields returned by backend as field descriptions', () => {
      props = {
        ...props,
        fieldDescriptions: {
          profession: { name: 'profession', type: 'text', label: 'Profession' },
          terms_of_service: {
            name: FIELDS.TERMS_OF_SERVICE,
            error_message: 'You must agree to the Terms and Service agreement of our site',
          },
        },
      };

      render(routerWrapper(renderWrapper(
        <ConfigurableRegistrationForm {...props} />,
      )));

      expect(document.querySelector('#profession')).toBeTruthy();
      expect(document.querySelector('#tos')).toBeTruthy();
    });

    it('should check TOS and honor code fields if they exist when auto submitting register form', () => {
      props = {
        ...props,
        formFields: {
          country: {
            countryCode: '',
            displayValue: '',
          },
        },
        fieldDescriptions: {
          terms_of_service: {
            name: FIELDS.TERMS_OF_SERVICE,
            error_message: 'You must agree to the Terms and Service agreement of our site',
          },
          honor_code: {
            name: FIELDS.HONOR_CODE,
            error_message: 'You must agree to the Honor Code agreement of our site',
          },
        },
        autoSubmitRegistrationForm: true,
      };

      render(routerWrapper(renderWrapper(
        <ConfigurableRegistrationForm {...props} />,
      )));

      expect(props.setFormFields).toHaveBeenCalledTimes(2);
      expect(props.setFormFields.mock.calls[0][0]()).toEqual({
        [FIELDS.HONOR_CODE]: true,
      });

      expect(props.setFormFields.mock.calls[1][0]()).toEqual({
        [FIELDS.TERMS_OF_SERVICE]: true,
      });
    });

    it('should render fields returned by backend', () => {
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        fieldDescriptions: {
          profession: { name: 'profession', type: 'text', label: 'Profession' },
          terms_of_service: {
            name: FIELDS.TERMS_OF_SERVICE,
            error_message: 'You must agree to the Terms and Service agreement of our site',
          },
        },
      });
      render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      expect(document.querySelector('#profession')).toBeTruthy();
      expect(document.querySelector('#tos')).toBeTruthy();
    });

    it('should submit form with fields returned by backend in payload', () => {
      mergeConfig({
        SHOW_CONFIGURABLE_EDX_FIELDS: true,
      });
      getLocale.mockImplementation(() => ('en-us'));
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      useThirdPartyAuthContext.mockReturnValue({
        currentProvider: null,
        platformName: '',
        providers: [],
        secondaryProviders: [],
        handleInstitutionLogin: jest.fn(),
        handleInstitutionLogout: jest.fn(),
        isInstitutionAuthActive: false,
        institutionLogin: false,
        pipelineDetails: {},
        fieldDescriptions: {
          profession: { name: 'profession', type: 'text', label: 'Profession' },
        },
        optionalFields: ['profession'],
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
        setEmailSuggestionContext: jest.fn(),
      });

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        profession: 'Engineer',
        total_registration_time: 0,
      };

      const mockRegisterUser = jest.fn();
      useRegistration.mockReturnValue({
        mutate: mockRegisterUser,
        isLoading: false,
        error: null,
      });
      useThirdPartyAuthContext.mockReturnValue({
        ...mockThirdPartyAuthContext,
        fieldDescriptions: {
          profession: {
            name: 'profession', type: 'text', label: 'Profession',
          },
        },
        setThirdPartyAuthContextBegin: jest.fn(),
        setThirdPartyAuthContextSuccess: jest.fn(),
        setThirdPartyAuthContextFailure: jest.fn(),
        setEmailSuggestionContext: jest.fn(),
      });

      const { getByLabelText, container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      populateRequiredFields(getByLabelText, payload);

      const professionInput = getByLabelText('Profession');
      fireEvent.change(professionInput, { target: { value: 'Engineer', name: 'profession' } });

      const submitButton = container.querySelector('button.btn-brand');

      fireEvent.click(submitButton);

      expect(mockRegisterUser).toHaveBeenCalledWith({ ...payload, country: 'PK' });
    });

    it('should show error messages for required fields on empty form submission', () => {
      const professionError = 'Enter your profession';
      const countryError = 'Select your country or region of residence';
      const confirmEmailError = 'Enter your email';

      useThirdPartyAuthContext.mockReturnValue({
        currentProvider: null,
        platformName: '',
        providers: [],
        secondaryProviders: [],
        handleInstitutionLogin: jest.fn(),
        handleInstitutionLogout: jest.fn(),
        isInstitutionAuthActive: false,
        institutionLogin: false,
        pipelineDetails: {},
        fieldDescriptions: {
          profession: {
            name: 'profession', type: 'text', label: 'Profession', error_message: professionError,
          },
          confirm_email: {
            name: 'confirm_email', type: 'text', label: 'Confirm Email', error_message: confirmEmailError,
          },
          country: { name: 'country' },
        },
        optionalFields: [],
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
        setEmailSuggestionContext: jest.fn(),
        clearThirdPartyAuthErrorMessage: jest.fn(),
      });

      const { container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      const submitButton = container.querySelector('button.btn-brand');

      fireEvent.click(submitButton);

      const professionErrorElement = container.querySelector('#profession-error');
      const countryErrorElement = container.querySelector('div[feedback-for="country"]');
      const confirmEmailErrorElement = container.querySelector('#confirm_email-error');

      expect(professionErrorElement.textContent).toEqual(professionError);
      expect(countryErrorElement.textContent).toEqual(countryError);
      expect(confirmEmailErrorElement.textContent).toEqual(confirmEmailError);
    });

    it('should show country field validation when country name is invalid', () => {
      const invalidCountryError = 'Country must match with an option available in the dropdown.';

      useThirdPartyAuthContext.mockReturnValue({
        currentProvider: null,
        platformName: '',
        providers: [],
        secondaryProviders: [],
        handleInstitutionLogin: jest.fn(),
        handleInstitutionLogout: jest.fn(),
        isInstitutionAuthActive: false,
        institutionLogin: false,
        pipelineDetails: {},
        fieldDescriptions: {
          country: { name: 'country' },
        },
        optionalFields: [],
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
        setEmailSuggestionContext: jest.fn(),
        clearThirdPartyAuthErrorMessage: jest.fn(),
      });
      const { container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));
      const countryInput = container.querySelector('input[name="country"]');
      fireEvent.change(countryInput, { target: { value: 'Pak', name: 'country' } });
      fireEvent.blur(countryInput, { target: { value: 'Pak', name: 'country' } });

      const submitButton = container.querySelector('button.btn-brand');
      fireEvent.click(submitButton);

      const countryErrorElement = container.querySelector('div[feedback-for="country"]');

      expect(countryErrorElement.textContent).toEqual(invalidCountryError);
    });

    it('should show error if email and confirm email fields do not match', () => {
      useThirdPartyAuthContext.mockReturnValue({
        currentProvider: null,
        platformName: '',
        providers: [],
        secondaryProviders: [],
        handleInstitutionLogin: jest.fn(),
        handleInstitutionLogout: jest.fn(),
        isInstitutionAuthActive: false,
        institutionLogin: false,
        pipelineDetails: {},
        thirdPartyAuthContext: {
          autoSubmitRegForm: false,
          currentProvider: null,
          finishAuthUrl: null,
          pipelineUserDetails: null,
          providers: [],
          secondaryProviders: [],
          errorMessage: null,
        },
        fieldDescriptions: {
          confirm_email: {
            name: 'confirm_email', type: 'text', label: 'Confirm Email',
          },
        },
        optionalFields: [],
        setThirdPartyAuthContextBegin: jest.fn(),
        setThirdPartyAuthContextSuccess: jest.fn(),
        setThirdPartyAuthContextFailure: jest.fn(),
        setEmailSuggestionContext: jest.fn(),
        clearThirdPartyAuthErrorMessage: jest.fn(),
      });
      const { getByLabelText, container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));

      const emailInput = getByLabelText('Email');
      const confirmEmailInput = getByLabelText('Confirm Email');

      fireEvent.change(emailInput, { target: { value: 'test1@gmail.com', name: 'email' } });
      fireEvent.blur(confirmEmailInput, { target: { value: 'test2@gmail.com', name: 'confirm_email' } });

      const confirmEmailErrorElement = container.querySelector('div#confirm_email-error');

      expect(confirmEmailErrorElement.textContent).toEqual('The email addresses do not match.');
    });

    it('should show error if email and confirm email fields do not match on submit click', () => {
      const formPayload = {
        name: 'Petro',
        username: 'petro_qa',
        email: 'petro@example.com',
        password: 'password1',
        country: 'Ukraine',
        honor_code: true,
        total_registration_time: 0,
      };

      useThirdPartyAuthContext.mockReturnValue({
        currentProvider: null,
        platformName: '',
        providers: [],
        secondaryProviders: [],
        handleInstitutionLogin: jest.fn(),
        handleInstitutionLogout: jest.fn(),
        isInstitutionAuthActive: false,
        institutionLogin: false,
        pipelineDetails: {},
        thirdPartyAuthContext: {
          autoSubmitRegForm: false,
          currentProvider: null,
          finishAuthUrl: null,
          pipelineUserDetails: null,
          providers: [],
          secondaryProviders: [],
          errorMessage: null,
        },
        fieldDescriptions: {
          confirm_email: {
            name: 'confirm_email', type: 'text', label: 'Confirm Email',
          },
          country: { name: 'country' },
        },
        optionalFields: [],
        setThirdPartyAuthContextBegin: jest.fn(),
        setThirdPartyAuthContextSuccess: jest.fn(),
        setThirdPartyAuthContextFailure: jest.fn(),
        setEmailSuggestionContext: jest.fn(),
        clearThirdPartyAuthErrorMessage: jest.fn(),
      });
      const { getByLabelText, container } = render(routerWrapper(renderWrapper(<RegistrationPage {...props} />)));

      populateRequiredFields(getByLabelText, formPayload, true);
      fireEvent.change(
        getByLabelText('Confirm Email'),
        { target: { value: 'test2@gmail.com', name: 'confirm_email' } },
      );

      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);

      const confirmEmailErrorElement = container.querySelector('div#confirm_email-error');
      expect(confirmEmailErrorElement.textContent).toEqual('The email addresses do not match.');

      const validationErrors = container.querySelector('#validation-errors');
      expect(validationErrors.textContent).toContain(
        "We couldn't create your account.Please check your responses and try again.",
      );
    });

    it('should run validations for configurable focused field on form submission', () => {
      const professionError = 'Enter your profession';
      useThirdPartyAuthContext.mockReturnValue({
        currentProvider: null,
        platformName: '',
        providers: [],
        secondaryProviders: [],
        handleInstitutionLogin: jest.fn(),
        handleInstitutionLogout: jest.fn(),
        isInstitutionAuthActive: false,
        institutionLogin: false,
        pipelineDetails: {},
        thirdPartyAuthContext: {
          autoSubmitRegForm: false,
          currentProvider: null,
          finishAuthUrl: null,
          pipelineUserDetails: null,
          providers: [],
          secondaryProviders: [],
          errorMessage: null,
        },
        fieldDescriptions: {
          profession: {
            name: 'profession', type: 'text', label: 'Profession', error_message: professionError,
          },
        },
        optionalFields: [],
        setThirdPartyAuthContextBegin: jest.fn(),
        setThirdPartyAuthContextSuccess: jest.fn(),
        setThirdPartyAuthContextFailure: jest.fn(),
        setEmailSuggestionContext: jest.fn(),
        clearThirdPartyAuthErrorMessage: jest.fn(),
      });

      const { getByLabelText, container } = render(
        routerWrapper(renderWrapper(<RegistrationPage {...props} />)),
      );

      const professionInput = getByLabelText('Profession');
      fireEvent.focus(professionInput);

      const submitButton = container.querySelector('button.btn-brand');
      fireEvent.click(submitButton);

      const professionErrorElement = container.querySelector('#profession-error');

      expect(professionErrorElement.textContent).toEqual(professionError);
    });
  });
});
