import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  configure, getLocale, injectIntl, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { fireEvent, render } from '@testing-library/react';
import { mockNavigate, BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import {
  backupRegistrationFormBegin,
  clearRegistrationBackendError,
  registerNewUser,
  setUserPipelineDataLoaded,
} from './data/actions';
import { INTERNAL_SERVER_ERROR } from './data/constants';
import RegistrationPage from './RegistrationPage';
import {
  AUTHN_PROGRESSIVE_PROFILING, COMPLETE_STATE, PENDING_STATE, REGISTER_PAGE,
} from '../data/constants';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));

const IntlRegistrationPage = injectIntl(RegistrationPage);
const mockStore = configureStore();

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

describe('RegistrationPage', () => {
  mergeConfig({
    PRIVACY_POLICY: 'https://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'https://tos-and-honot-code.com',
    USER_RETENTION_COOKIE_NAME: 'authn-returning-user',
  });

  let props = {};
  let store = {};
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

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const routerWrapper = children => (
    <Router>
      {children}
    </Router>
  );

  const thirdPartyAuthContext = {
    currentProvider: null,
    finishAuthUrl: null,
    providers: [],
    pipelineUserDetails: null,
    countryCode: null,
  };

  const initialState = {
    register: {
      registrationResult: { success: false, redirectUrl: '' },
      registrationError: {},
      registrationFormData,
      usernameSuggestions: [],

    },
    commonComponents: {
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext,
      fieldDescriptions: {},
      optionalFields: {
        fields: {},
        extended_profile: [],
      },
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
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

  describe('Test Registration Page', () => {
    mergeConfig({
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
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
      window.location = { href: getConfig().BASE_URL, search: '?next=/course/demo-course-url' };

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@gmail.com',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        next: '/course/demo-course-url',
      };

      store.dispatch = jest.fn(store.dispatch);
      const { getByLabelText, container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      populateRequiredFields(getByLabelText, payload);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);

      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));
    });

    it('should submit form without password field when current provider is present', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      const formPayload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        country: 'Pakistan',
        honor_code: true,
        social_auth_provider: 'Apple',
        totalRegistrationTime: 0,
      };

      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            currentProvider: 'Apple',
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);
      const { getByLabelText, container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

      populateRequiredFields(getByLabelText, formPayload, true);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...formPayload, country: 'PK' }));
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
        honor_code: true,
        totalRegistrationTime: 0,
      };

      store.dispatch = jest.fn(store.dispatch);
      const { getByLabelText, container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
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
        honor_code: true,
        totalRegistrationTime: 0,
      };

      store.dispatch = jest.fn(store.dispatch);
      const { getByLabelText, container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      populateRequiredFields(getByLabelText, formPayload, true);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);
      const validationErrors = container.querySelector('#validation-errors');
      expect(validationErrors.textContent).toContain(usernameError);
    });

    it('should submit form with marketing email opt in value', () => {
      mergeConfig({
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@gmail.com',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        marketing_emails_opt_in: true,
      };

      store.dispatch = jest.fn(store.dispatch);
      const { getByLabelText, container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      populateRequiredFields(getByLabelText, payload);
      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should not dispatch registerNewUser on empty form Submission', () => {
      store.dispatch = jest.fn(store.dispatch);

      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);

      expect(store.dispatch).not.toHaveBeenCalledWith(registerNewUser({}));
    });

    // ******** test registration form validations ********

    it('should show error messages for required fields on empty form submission', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

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
      const emailError = `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account`;
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            username: [{ userMessage: usernameError }],
            email: [{ userMessage: emailError }],
          },
        },
      });
      const { container } = render(routerWrapper(reduxWrapper(<IntlProvider locale="en"><IntlRegistrationPage {...props} /></IntlProvider>)));
      const usernameFeedback = container.querySelector('div[feedback-for="username"]');
      const emailFeedback = container.querySelector('div[feedback-for="email"]');

      expect(usernameFeedback.textContent).toContain(usernameError);
      expect(emailFeedback.textContent).toContain(emailError);
    });

    it('should clear error on focus', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

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
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            email: [{ userMessage: emailError }],
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      const { container } = render(routerWrapper(reduxWrapper(
        <IntlRegistrationPage {...props} />,
      )));

      const emailInput = container.querySelector('input#email');
      fireEvent.change(emailInput, { target: { value: 'test1@gmail.com', name: 'email' } });
      expect(store.dispatch).toHaveBeenCalledWith(clearRegistrationBackendError('email'));
    });

    // ******** test form buttons and fields ********

    it('should match default button state', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      const button = container.querySelector('button[type="submit"] span');
      expect(button.textContent).toEqual('Create an account for free');
    });

    it('should match pending button state', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          submitState: PENDING_STATE,
        },
      });

      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

      const button = container.querySelector('button[type="submit"] span.sr-only');
      expect(button.textContent).toEqual('pending');
    });

    it('should display opt-in/opt-out checkbox', () => {
      mergeConfig({
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      const checkboxDivs = container.querySelectorAll('div.form-field--checkbox');
      expect(checkboxDivs.length).toEqual(1);

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should show button label based on cta query params value', () => {
      const buttonLabel = 'Register';
      delete window.location;
      window.location = { href: getConfig().BASE_URL, search: `?cta=${buttonLabel}` };
      const { container } = render(reduxWrapper(<IntlRegistrationPage {...props} />));
      const button = container.querySelector('button[type="submit"] span');

      const buttonText = button.textContent;

      expect(buttonText).toEqual(buttonLabel);
    });

    it('should check user retention cookie', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
          },
        },
      });

      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(document.cookie).toMatch(`${getConfig().USER_RETENTION_COOKIE_NAME}=true`);
    });

    it('should redirect to url returned in registration result after successful account creation', () => {
      const dashboardURL = 'https://test.com/testing-dashboard/';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
            redirectUrl: dashboardURL,
          },
        },
      });
      delete window.location;
      window.location = { href: getConfig().BASE_URL };
      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(window.location.href).toBe(dashboardURL);
    });

    it('should redirect to dashboard if features flags are configured but no optional fields are configured', () => {
      mergeConfig({
        ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: true,
      });
      const dashboardUrl = 'https://test.com/testing-dashboard/';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
            redirectUrl: dashboardUrl,
          },
        },
        commonComponents: {
          ...initialState.commonComponents,
          optionalFields: {
            fields: {},
          },
        },
      });
      delete window.location;
      window.location = { href: getConfig().BASE_URL };
      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(window.location.href).toBe(dashboardUrl);
    });

    it('should redirect to progressive profiling page if optional fields are configured', () => {
      getLocale.mockImplementation(() => ('en-us'));
      mergeConfig({
        ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: true,
      });

      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
          },
        },
        commonComponents: {
          ...initialState.commonComponents,
          optionalFields: {
            extended_profile: [],
            fields: {
              level_of_education: { name: 'level_of_education', error_message: false },
            },
          },
        },
      });

      render(reduxWrapper(
        <Router>
          <IntlRegistrationPage {...props} />
        </Router>,
      ));
      expect(mockNavigate).toHaveBeenCalledWith(AUTHN_PROGRESSIVE_PROFILING);
    });

    // ******** miscellaneous tests ********

    it('should backup the registration form state when shouldBackupState is true', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          shouldBackupState: true,
        },
      });

      store.dispatch = jest.fn(store.dispatch);
      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(store.dispatch).toHaveBeenCalledWith(backupRegistrationFormBegin({ ...registrationFormData }));
    });

    it('should send page event when register page is rendered', () => {
      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'register');
    });

    it('should send track event when user has successfully registered', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
            redirectUrl: 'https://test.com/testing-dashboard/',
          },
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL };
      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.account.registered.client', {});
    });

    it('should populate form with pipeline user details', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backedUpFormData: { ...registrationFormData },
        },
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: COMPLETE_STATE,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            pipelineUserDetails: {
              email: 'test@example.com',
              username: 'test',
            },
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);
      const { container } = render(reduxWrapper(
        <Router>
          <IntlRegistrationPage {...props} />
        </Router>,
      ));

      const emailInput = container.querySelector('input#email');
      const usernameInput = container.querySelector('input#username');

      expect(emailInput.value).toEqual('test@example.com');
      expect(usernameInput.value).toEqual('test');
      expect(store.dispatch).toHaveBeenCalledWith(setUserPipelineDataLoaded(true));
    });

    it('should display error message based on the error code returned by API', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            errorCode: INTERNAL_SERVER_ERROR,
          },
        },
      });

      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      const validationErrors = container.querySelector('div#validation-errors');
      expect(validationErrors.textContent).toContain(
        'An error has occurred. Try refreshing the page, or check your internet connection.',
      );
    });

    it('should update form fields state if updated in redux store', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
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
        },
      });

      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

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
      mergeConfig({
        ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: true,
      });

      window.parent.postMessage = jest.fn();

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(AUTHN_PROGRESSIVE_PROFILING), search: '?host=http://localhost/host-website' };

      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
          },
        },
        commonComponents: {
          ...initialState.commonComponents,
          optionalFields: {
            extended_profile: {},
            fields: {
              level_of_education: { name: 'level_of_education', error_message: false },
            },
          },
        },
      });
      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(window.parent.postMessage).toHaveBeenCalledTimes(2);
    });

    it('should not display validations error on blur event when embedded variant is rendered', () => {
      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: '?host=http://localhost/host-website' };
      const { container } = render(reduxWrapper(<IntlRegistrationPage {...props} />));

      const usernameInput = container.querySelector('input#username');
      fireEvent.blur(usernameInput, { target: { value: '', name: 'username' } });
      expect(container.querySelector('div[feedback-for="username"]')).toBeFalsy();

      const countryInput = container.querySelector('input[name="country"]');
      fireEvent.blur(countryInput, { target: { value: '', name: 'country' } });
      expect(container.querySelector('div[feedback-for="country"]')).toBeFalsy();
    });

    it('should set errors in temporary state when validations are returned by registration api', () => {
      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: '?host=http://localhost/host-website' };

      const usernameError = 'It looks like this username is already taken';
      const emailError = 'This email is already associated with an existing or previous account';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            username: [{ userMessage: usernameError }],
            email: [{ userMessage: emailError }],
          },
        },
      });
      const { container } = render(routerWrapper(reduxWrapper(
        <IntlRegistrationPage {...props} />),
      ));

      const usernameFeedback = container.querySelector('div[feedback-for="username"]');
      const emailFeedback = container.querySelector('div[feedback-for="email"]');

      expect(usernameFeedback).toBeNull();
      expect(emailFeedback).toBeNull();
    });

    it('should clear error on focus for embedded experience also', () => {
      delete window.location;
      window.location = {
        href: getConfig().BASE_URL.concat(REGISTER_PAGE),
        search: '?host=http://localhost/host-website',
      };

      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      const submitButton = container.querySelector('button.btn-brand');
      fireEvent.click(submitButton);

      const passwordFeedback = container.querySelector('div[feedback-for="password"]');
      expect(passwordFeedback.textContent).toContain(emptyFieldValidation.password);

      const passwordField = container.querySelector('input#password');
      fireEvent.focus(passwordField);

      const updatedPasswordFeedback = container.querySelector('div[feedback-for="password"]');
      expect(updatedPasswordFeedback).toBeNull();
    });

    it('should show spinner instead of form while registering if autoSubmitRegForm is true', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      getLocale.mockImplementation(() => ('en-us'));

      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backendCountryCode: 'PK',
          userPipelineDataLoaded: false,
        },
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: COMPLETE_STATE,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            pipelineUserDetails: {
              name: 'John Doe',
              username: 'john_doe',
              email: 'john.doe@example.com',
            },
            autoSubmitRegForm: true,
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      const spinnerElement = container.querySelector('#tpa-spinner');
      const registrationFormElement = container.querySelector('#registration-form');

      expect(spinnerElement).toBeTruthy();
      expect(registrationFormElement).toBeFalsy();
    });

    it('should auto register if autoSubmitRegForm is true and pipeline details are loaded', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      getLocale.mockImplementation(() => ('en-us'));

      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backendCountryCode: 'PK',
          userPipelineDataLoaded: true,
          registrationFormData: {
            ...registrationFormData,
            formFields: {
              name: 'John Doe',
              username: 'john_doe',
              email: 'john.doe@example.com',
            },
            configurableFormFields: {
              marketingEmailsOptIn: true,
              country: {
                countryCode: 'PK',
                displayValue: 'Pakistan',
              },
            },
          },
        },
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: COMPLETE_STATE,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            currentProvider: 'Apple',
            pipelineUserDetails: {
              name: 'John Doe',
              username: 'john_doe',
              email: 'john.doe@example.com',
            },
            autoSubmitRegForm: true,
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        country: 'PK',
        social_auth_provider: 'Apple',
        totalRegistrationTime: 0,
      }));
    });
  });
});
