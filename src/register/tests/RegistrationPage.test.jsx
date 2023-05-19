import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import {
  configure, getLocale, injectIntl, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import {
  AUTHN_PROGRESSIVE_PROFILING, COMPLETE_STATE, LOGIN_PAGE, PENDING_STATE, REGISTER_PAGE,
} from '../../data/constants';
import {
  backupRegistrationFormBegin,
  clearUsernameSuggestions,
  fetchRealtimeValidations,
  registerNewUser,
  setUserPipelineDataLoaded,
} from '../data/actions';
import {
  FIELDS, FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR, TPA_AUTHENTICATION_FAILURE, TPA_SESSION_EXPIRED,
} from '../data/constants';
import RegistrationFailureMessage from '../RegistrationFailure';
import RegistrationPage from '../RegistrationPage';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));

const IntlRegistrationPage = injectIntl(RegistrationPage);
const IntlRegistrationFailure = injectIntl(RegistrationFailureMessage);
const mockStore = configureStore();
const history = createMemoryHistory();

describe('RegistrationPage', () => {
  mergeConfig({
    PRIVACY_POLICY: 'https://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'https://tos-and-honot-code.com',
    USER_SURVEY_COOKIE_NAME: process.env.USER_SURVEY_COOKIE_NAME,
    REGISTER_CONVERSION_COOKIE_NAME: process.env.REGISTER_CONVERSION_COOKIE_NAME,
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

  const thirdPartyAuthContext = {
    currentProvider: null,
    finishAuthUrl: null,
    providers: [],
    secondaryProviders: [],
    pipelineUserDetails: null,
    countryCode: null,
  };

  const initialState = {
    register: {
      registrationResult: { success: false, redirectUrl: '' },
      registrationError: {},
      registrationFormData,
    },
    commonComponents: {
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext,
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
      registrationResult: jest.fn(),
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const populateRequiredFields = (registrationPage, payload, isThirdPartyAuth = false) => {
    registrationPage.find('input#name').simulate('change', { target: { value: payload.name, name: 'name' } });
    registrationPage.find('input#username').simulate('change', { target: { value: payload.username, name: 'username' } });
    registrationPage.find('input#email').simulate('change', { target: { value: payload.email, name: 'email' } });

    registrationPage.find('input[name="country"]').simulate('change', { target: { value: payload.country, name: 'country' } });
    registrationPage.find('input[name="country"]').simulate('blur', { target: { value: payload.country, name: 'country' } });

    if (!isThirdPartyAuth) {
      registrationPage.find('input#password').simulate('change', { target: { value: payload.password, name: 'password' } });
    }
  };

  const ssoProvider = {
    id: 'oa2-apple-id',
    name: 'Apple',
    iconClass: 'apple',
    iconImage: 'https://openedx.devstack.lms/logo.png',
    loginUrl: '/auth/login/apple-id/?auth_entry=login&next=/dashboard',
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

    const secondaryProviders = {
      id: 'saml-test', name: 'Test University', loginUrl: '/dummy-auth', registerUrl: '/dummy_auth',
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
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      populateRequiredFields(registrationPage, payload);
      registrationPage.find('button.btn-brand').simulate('click');
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
        social_auth_provider: ssoProvider.name,
        totalRegistrationTime: 0,
      };

      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            currentProvider: ssoProvider.name,
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      populateRequiredFields(registrationPage, formPayload, true);
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...formPayload, country: 'PK' }));
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
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      populateRequiredFields(registrationPage, payload);
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should not dispatch registerNewUser on empty form Submission', () => {
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).not.toHaveBeenCalledWith(registerNewUser({}));
    });

    // ******** test registration form validations ********

    it('should show error messages for required fields on empty form submission', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="name"]').text()).toEqual(emptyFieldValidation.name);
      expect(registrationPage.find('div[feedback-for="username"]').text()).toEqual(emptyFieldValidation.username);
      expect(registrationPage.find('div[feedback-for="email"]').text()).toEqual(emptyFieldValidation.email);
      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);
      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);

      const alertBanner = 'We couldn\'t create your account.Please check your responses and try again.';
      expect(registrationPage.find('#validation-errors').first().text()).toEqual(alertBanner);
    });

    it('should update errors for frontend validations', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      registrationPage.find('input#name').simulate('blur', { target: { value: 'http://test.com', name: 'name' } });
      expect(
        registrationPage.find('div[feedback-for="name"]').text(),
      ).toEqual('Enter a valid name');

      registrationPage.find('input#password').simulate('blur', { target: { value: 'pas', name: 'password' } });
      expect(
        registrationPage.find('div[feedback-for="password"]').text(),
      ).toContain('Password criteria has not been met');

      registrationPage.find('input#username').simulate('blur', { target: { value: 'u$ername', name: 'username' } });
      expect(
        registrationPage.find('div[feedback-for="username"]').text(),
      ).toContain(
        'Usernames can only contain letters (A-Z, a-z), numerals (0-9),'
                  + ' underscores (_), and hyphens (-). Usernames cannot contain spaces',
      );

      registrationPage.find('input#email').simulate('blur', { target: { value: 'ab', name: 'email' } });
      expect(
        registrationPage.find('div[feedback-for="email"]').text(),
      ).toEqual('Enter a valid email address');
    });

    it('should validate fields on blur event', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      registrationPage.find('input#username').simulate('blur', { target: { value: '', name: 'username' } });
      expect(registrationPage.find('div[feedback-for="username"]').text()).toEqual(emptyFieldValidation.username);

      registrationPage.find('input#name').simulate('blur', { target: { value: '', name: 'name' } });
      expect(registrationPage.find('div[feedback-for="name"]').text()).toEqual(emptyFieldValidation.name);

      registrationPage.find('input#email').simulate('blur', { target: { value: '', name: 'email' } });
      expect(registrationPage.find('div[feedback-for="email"]').text()).toEqual(emptyFieldValidation.email);

      registrationPage.find('input#password').simulate('blur', { target: { value: '', name: 'password' } });
      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);

      registrationPage.find('input[name="country"]').simulate('blur', { target: { value: '', name: 'country' } });
      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);
    });

    it('should call validation api on blur event, if frontend validations have passed', () => {
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      // Enter a valid name so that frontend validations are passed
      registrationPage.find('input#name').simulate('change', { target: { value: 'John Doe', name: 'name' } });
      registrationPage.find('input#name').simulate('blur');
      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({
        form_field_key: 'name', email: '', name: 'John Doe', username: '', password: '',
      }));

      // Enter a valid username so that frontend validations are passed
      registrationPage.find('input#username').simulate('change', { target: { value: 'john', name: 'username' } });
      registrationPage.find('input#username').simulate('blur');
      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({
        form_field_key: 'username', email: '', name: 'John Doe', username: 'john', password: '',
      }));
    });

    it('should run validations for focused field on form submission', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input[name="country"]').simulate('focus');
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);
    });

    it('should give email suggestions for common service provider domain typos', () => {
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      registrationPage.find('input#email').simulate('change', { target: { value: 'john@yopmail.com', name: 'email' } });
      registrationPage.find('input#email').simulate('blur');

      expect(registrationPage.find('#email-warning').text()).toEqual('Did you mean: john@hotmail.com?');
    });
    it('should click on email suggestions for common service provider domain typos', () => {
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      registrationPage.find('input#email').simulate('change', { target: { value: 'john@yopmail.com', name: 'email' } });
      registrationPage.find('input#email').simulate('blur');
      registrationPage.find('.email-warning-alert-link').first().simulate('click');
      expect(registrationPage.find('input#email').props().value).toEqual('john@hotmail.com');
    });

    it('should give error for common top level domain mistakes', () => {
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      registrationPage
        .find('input#email')
        .simulate('change', { target: { value: 'john@gmail.mistake', name: 'email' } });

      registrationPage.find('input#email').simulate('blur');

      expect(registrationPage.find('.alert-danger').text()).toEqual('Did you mean john@gmail.com?');
    });

    it('should update props with validations returned by registration api', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            username: [{ userMessage: 'It looks like this username is already taken' }],
            email: [{ userMessage: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account` }],
          },
        },
      });
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');
      expect(registrationPage.prop('backendValidations')).toEqual({
        email: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account`,
        username: 'It looks like this username is already taken',
      });
    });

    it('should remove space from the start of username', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#username').simulate('change', { target: { value: ' test-user', name: 'username' } });

      expect(registrationPage.find('input#username').prop('value')).toEqual('test-user');
    });
    it('should remove extra character if username is more than 30 character long', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#username').simulate('change', { target: { value: 'why_this_is_not_valid_username_', name: 'username' } });

      expect(registrationPage.find('input#username').prop('value')).toEqual('');
    });

    it('should give error with suggestion for common top level domain mistakes', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#email').simulate('change', { target: { value: 'ahtesham@hotmail', name: 'email' } });
      registrationPage.find('input#email').simulate('blur');

      const receievedMessage = 'Did you mean ahtesham@hotmail.com?';
      expect(registrationPage.find('.alert-text').text()).toEqual(receievedMessage);
    });

    it('should call backend validation api for password validation', () => {
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#password').simulate('change', { target: { value: 'aziz194@', name: 'password' } });
      registrationPage.find('input#password').simulate('blur');

      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({
        form_field_key: 'password', email: '', name: '', username: '', password: 'aziz194@',
      }));
    });
    // ******** test field focus in functionality ********

    it('should clear field related error messages on input field Focus', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="name"]').text()).toEqual(emptyFieldValidation.name);
      registrationPage.find('input#name').simulate('focus');
      expect(registrationPage.find('div[feedback-for="name"]').exists()).toBeFalsy();

      expect(registrationPage.find('div[feedback-for="username"]').text()).toEqual(emptyFieldValidation.username);
      registrationPage.find('input#username').simulate('focus');
      expect(registrationPage.find('div[feedback-for="username"]').exists()).toBeFalsy();

      expect(registrationPage.find('div[feedback-for="email"]').text()).toEqual(emptyFieldValidation.email);
      registrationPage.find('input#email').simulate('focus');
      expect(registrationPage.find('div[feedback-for="email"]').exists()).toBeFalsy();

      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);
      registrationPage.find('input#password').simulate('focus');
      expect(registrationPage.find('div[feedback-for="password"]').exists()).toBeFalsy();

      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);
      registrationPage.find('input[name="country"]').simulate('focus');
      expect(registrationPage.find('div[feedback-for="country"]').exists()).toBeFalsy();
    });

    it('should clear username suggestions when username field is focused in', () => {
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#username').simulate('focus');

      expect(store.dispatch).toHaveBeenCalledWith(clearUsernameSuggestions());
    });

    // ******** test alert messages ********

    it('should match third party auth alert', () => {
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

      const expectedMessage = `${'You\'ve successfully signed into Apple! We just need a little more information before '
                              + 'you start learning with '}${ getConfig().SITE_NAME }.`;

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('#tpa-alert').find('p').text()).toEqual(expectedMessage);
    });

    it('should match internal server error message', () => {
      const expectedMessage = 'We couldn\'t create your account.An error has occurred. Try refreshing the page, or check your internet connection.';
      props = {
        errorCode: INTERNAL_SERVER_ERROR,
        failureCount: 0,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toEqual(expectedMessage);
    });

    it('should match registration api rate limit error message', () => {
      const expectedMessage = 'We couldn\'t create your account.Too many failed registration attempts. Try again later.';
      props = {
        errorCode: FORBIDDEN_REQUEST,
        failureCount: 0,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toEqual(expectedMessage);
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

      const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toEqual(expectedMessage);
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

      const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toContain(expectedMessageSubstring);
    });

    // ******** test form buttons and fields ********

    it('should match default button state', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('button[type="submit"] span').first().text()).toEqual('Create an account for free');
    });

    it('should match pending button state', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          submitState: PENDING_STATE,
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      const button = registrationPage.find('button[type="submit"] span').first();

      expect(button.find('.sr-only').text()).toEqual('pending');
    });

    it('should display opt-in/opt-out checkbox', () => {
      mergeConfig({
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('div.opt-checkbox').length).toEqual(1);

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should show single sign on provider button', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find(`button#${ssoProvider.id}`).length).toEqual(1);
    });

    it('should display institution register button', () => {
      mergeConfig({
        DISABLE_ENTERPRISE_LOGIN: 'true',
      });

      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            secondaryProviders: [secondaryProviders],
          },
        },
      });
      delete window.location;
      window.location = { href: getConfig().BASE_URL };

      const root = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(root.text().includes('Institution/campus credentials')).toBe(true);

      mergeConfig({
        DISABLE_ENTERPRISE_LOGIN: '',
      });
    });

    it('should display no password field when current provider is present', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            currentProvider: ssoProvider.name,
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('input#password').length).toEqual(0);
    });

    it('should set registration survey cookie', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
          },
        },
      });

      renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(document.cookie).toMatch(`${getConfig().USER_SURVEY_COOKIE_NAME}=register`);
      expect(document.cookie).toMatch(`${getConfig().REGISTER_CONVERSION_COOKIE_NAME}=true`);
    });

    it('should show username suggestions in case of conflict with an existing username', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            errors: {
              ...registrationFormData.errors,
              username: 'It looks like this username is already taken',
            },
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('button.username-suggestion').length).toEqual(3);
    });

    it('should show username suggestions when full name is populated', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });

      expect(registrationPage.find('button.username-suggestion').length).toEqual(3);
    });

    it('should click on username suggestions when full name is populated', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });
      registrationPage.find('.username-suggestion').first().simulate('click');
      expect(registrationPage.find('input#username').props().value).toEqual('test_1');
    });

    it('should clear username suggestions when close icon is clicked', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });
      registrationPage.find('button.suggested-username-close-button').at(0).simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(clearUsernameSuggestions());
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
      renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(window.location.href).toBe(dashboardURL);
    });

    it('should redirect to social auth provider url on SSO button click', () => {
      const registerUrl = '/auth/login/apple-id/?auth_entry=register&next=/dashboard';
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [{
              ...ssoProvider,
              registerUrl,
            }],
          },
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL };

      const loginPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      loginPage.find('button#oa2-apple-id').simulate('click');
      expect(window.location.href).toBe(getConfig().LMS_BASE_URL + registerUrl);
    });

    it('should redirect to finishAuthUrl upon successful registration via SSO', () => {
      const authCompleteUrl = '/auth/complete/google-oauth2/';
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
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            finishAuthUrl: authCompleteUrl,
          },
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL };

      renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(window.location.href).toBe(getConfig().LMS_BASE_URL + authCompleteUrl);
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
      });
      delete window.location;
      window.location = { href: getConfig().BASE_URL };
      renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
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
          optionalFields: {
            extended_profile: {},
            fields: {
              level_of_education: { name: 'level_of_education', error_message: false },
            },
          },
        },
      });

      const progressiveProfilingPage = mount(reduxWrapper(
        <Router history={history}>
          <IntlRegistrationPage {...props} />
        </Router>,
      ));
      progressiveProfilingPage.update();
      expect(history.location.pathname).toEqual(AUTHN_PROGRESSIVE_PROFILING);
    });

    // ******** test hinted third party auth ********

    it('should render tpa button for tpa_hint id matching one of the primary providers', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
          thirdPartyAuthApiStatus: COMPLETE_STATE,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };
      ssoProvider.iconImage = null;

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find(`button#${ssoProvider.id}`).find('span').text()).toEqual(ssoProvider.name);
      expect(registrationPage.find(`button#${ssoProvider.id}`).hasClass(`btn-tpa btn-${ssoProvider.id}`)).toEqual(true);
    });

    it('should render icon if icon classes are missing in providers', () => {
      ssoProvider.iconClass = null;
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
          thirdPartyAuthApiStatus: COMPLETE_STATE,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find(`button#${ssoProvider.id}`).find('div').find('span').hasClass('pgn__icon')).toEqual(true);
    });

    it('should render tpa button for tpa_hint id matching one of the secondary providers', () => {
      secondaryProviders.skipHintedLogin = true;
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            secondaryProviders: [secondaryProviders],
          },
          thirdPartyAuthApiStatus: COMPLETE_STATE,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };
      secondaryProviders.iconImage = null;

      mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(window.location.href).toEqual(getConfig().LMS_BASE_URL + secondaryProviders.registerUrl);
    });

    it('should render regular tpa button for invalid tpa_hint value', () => {
      const expectedMessage = `${ssoProvider.name}`;
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
          thirdPartyAuthApiStatus: COMPLETE_STATE,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: '?next=/dashboard&tpa_hint=invalid' };
      ssoProvider.iconImage = null;

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find(`button#${ssoProvider.id}`).find('span#provider-name').text()).toEqual(expectedMessage);
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
      mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(store.dispatch).toHaveBeenCalledWith(backupRegistrationFormBegin({ ...registrationFormData }));
    });

    it('should send page event when register page is rendered', () => {
      mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'register');
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

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');
      expect(registrationPage.find('input#email').props().value).toEqual('test@example.com');
      expect(registrationPage.find('input#username').props().value).toEqual('test');
      expect(store.dispatch).toHaveBeenCalledWith(setUserPipelineDataLoaded(true));
    });

    it('should update state from country code present in redux store', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backendCountryCode: 'PK',
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('input[name="country"]').props().value).toEqual('Pakistan');
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

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');
      expect(registrationPage.find('div#validation-errors').first().text()).toContain(
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

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');

      expect(registrationPage.find('input#name').props().value).toEqual('John Doe');
      expect(registrationPage.find('input#username').props().value).toEqual('john_doe');
      expect(registrationPage.find('input#email').props().value).toEqual('john.doe@yopmail.com');
      expect(registrationPage.find('input#password').props().value).toEqual('password1');
      expect(registrationPage.find('.email-warning-alert-link').first().text()).toEqual('john.doe@hotmail.com');
    });

    it('should set country in component state when form is translated used i18n', () => {
      getLocale.mockImplementation(() => ('ar-ae'));

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input[name="country"]').simulate('click');
      registrationPage.find('button.dropdown-item').at(0).simulate('click', { target: { value: 'أفغانستان ', name: 'countryItem' } });
      expect(registrationPage.find('div[feedback-for="country"]').exists()).toBeFalsy();
    });

    it('should clear the registation validation error on change event on field focused', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            errorCode: 'duplicate-email',
            email: [{ userMessage: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account` }],
          },
        },
      });

      store.dispatch = jest.fn(store.dispatch);
      const clearBackendError = jest.fn();
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} {...clearBackendError} />));
      registrationPage.find('input#email').simulate('change', { target: { value: 'a@gmail.com', name: 'email' } });
      expect(registrationPage.find('div[feedback-for="email"]').exists()).toBeFalsy();
    });
  });

  describe('Test Configurable Fields', () => {
    mergeConfig({
      ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
    });

    it('should render fields returned by backend', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: { name: 'profession', type: 'text', label: 'Profession' },
            terms_of_service: {
              name: FIELDS.TERMS_OF_SERVICE,
              error_message: 'You must agree to the Terms and Service agreement of our site',
            },
          },
        },
      });
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('#profession').exists()).toBeTruthy();
      expect(registrationPage.find('#tos').exists()).toBeTruthy();
    });

    it('should submit form with fields returned by backend in payload', () => {
      getLocale.mockImplementation(() => ('en-us'));
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: { name: 'profession', type: 'text', label: 'Profession' },
          },
          extendedProfile: ['profession'],
        },
      });

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        profession: 'Engineer',
        totalRegistrationTime: 0,
      };

      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      populateRequiredFields(registrationPage, payload);
      registrationPage.find('input#profession').simulate('change', { target: { value: 'Engineer', name: 'profession' } });
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));
    });

    it('should show error messages for required fields on empty form submission', () => {
      const professionError = 'Enter your profession';
      const countryError = 'Select your country or region of residence';
      const confirmEmailError = 'Enter your email';

      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: {
              name: 'profession', type: 'text', label: 'Profession', error_message: professionError,
            },
            confirm_email: {
              name: 'confirm_email', type: 'text', label: 'Confirm Email', error_message: confirmEmailError,
            },
            country: { name: 'country' },
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('#profession-error').last().text()).toEqual(professionError);
      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(countryError);
      expect(registrationPage.find('#confirm_email-error').last().text()).toEqual(confirmEmailError);
    });

    it('should show error if email and confirm email fields do not match', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            confirm_email: {
              name: 'confirm_email', type: 'text', label: 'Confirm Email',
            },
          },
        },
      });
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#email').simulate('change', { target: { value: 'test1@gmail.com', name: 'email' } });
      registrationPage.find('input#confirm_email').simulate('blur', { target: { value: 'test2@gmail.com', name: 'confirm_email' } });
      expect(registrationPage.find('div#confirm_email-error').text()).toEqual('The email addresses do not match.');
    });

    it('should run validations for configurable focused field on form submission', () => {
      const professionError = 'Enter your profession';
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: {
              name: 'profession', type: 'text', label: 'Profession', error_message: professionError,
            },
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#profession').simulate('focus', { target: { value: '', name: 'profession' } });
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('#profession-error').last().text()).toEqual(professionError);
    });

    it('should check TOS and honor code fields if they exist when auto submitting register form', () => {
      getLocale.mockImplementation(() => ('en-us'));
      store = mockStore({
        ...initialState,
        register: { // setting register to display form for testing TOS and honor code value.
          ...initialState.register,
          registrationError: {
            errorCode: 'register-error',
          },
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
            autoSubmitRegForm: true,
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
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      expect(registrationPage.find('input#tos').props().value).toEqual(true);
      expect(registrationPage.find('input#honor-code').props().value).toEqual(true);
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
            currentProvider: ssoProvider.name,
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

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('#tpa-spinner').exists()).toBeTruthy();
      expect(registrationPage.find('#registration-form').exists()).toBeFalsy();
    });

    it('should set autoSubmitRegisterForm false if third party authentication fails', () => {
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
            currentProvider: ssoProvider.name,
            pipelineUserDetails: {},
            errorMessage: 'An error occured',
            autoSubmitRegForm: true,
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('#tpa-spinner').exists()).toBeFalsy();
      expect(registrationPage.find('#registration-form').exists()).toBeTruthy();
    });

    it('should display errorMessage if third party authentication fails', () => {
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
            currentProvider: null,
            pipelineUserDetails: {},
            errorMessage: 'An error occured',
          },
        },
      });

      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toContain('An error occured');
    });

    it('should not run country field validation when onBlur is fired by drop-down arrow icon click', () => {
      getLocale.mockImplementation(() => ('en-us'));

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input[name="country"]').simulate('blur', {
        target: { value: '', name: 'country' },
        relatedTarget: { type: 'button', className: 'btn-icon pgn__form-autosuggest__icon-button' },
      });
      expect(registrationPage.find('div[feedback-for="country"]').exists()).toBeFalsy();
    });
  });
});
