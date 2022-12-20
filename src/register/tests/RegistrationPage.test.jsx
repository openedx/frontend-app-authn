import React from 'react';
import { Provider } from 'react-redux';

import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import {
  configure, getLocale, injectIntl, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import { COMPLETE_STATE, PENDING_STATE, WELCOME_PAGE } from '../../data/constants';
import {
  clearUsernameSuggestions,
  fetchRealtimeValidations,
  registerNewUser,
  resetRegistrationForm,
  setRegistrationFormData,
} from '../data/actions';
import {
  FIELDS, FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR, TPA_SESSION_EXPIRED,
} from '../data/constants';
import RegistrationFailureMessage from '../RegistrationFailure';
import RegistrationPage from '../RegistrationPage';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();

const IntlRegistrationPage = injectIntl(RegistrationPage);
const IntlRegistrationFailure = injectIntl(RegistrationFailureMessage);
const mockStore = configureStore();

describe('RegistrationPage', () => {
  mergeConfig({
    PRIVACY_POLICY: 'http://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'http://tos-and-honot-code.com',
    USER_SURVEY_COOKIE_NAME: process.env.USER_SURVEY_COOKIE_NAME,
    REGISTER_CONVERSION_COOKIE_NAME: process.env.REGISTER_CONVERSION_COOKIE_NAME,
  });

  let props = {};
  let store = {};
  let registrationFormData = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const thirdPartyAuthContext = {
    platformName: 'openedX',
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
    registrationFormData = {
      country: '',
      email: '',
      name: '',
      password: '',
      username: '',
      marketingOptIn: true,
      errors: {
        email: '',
        name: '',
        username: '',
        password: '',
        country: '',
      },
      emailFieldBorderClass: '',
      emailErrorSuggestion: null,
      emailWarningSuggestion: null,
    };
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

  const populateRequiredFields = (registerPage, payload, isThirdPartyAuth = false) => {
    registerPage.find('input#name').simulate('change', { target: { value: payload.name, name: 'name' } });
    registerPage.find('input#username').simulate('change', { target: { value: payload.username, name: 'username' } });
    registerPage.find('input#email').simulate('change', { target: { value: payload.email, name: 'email' } });
    registerPage.find('input#country').simulate('change', { target: { value: payload.country, name: 'country' } });

    if (!isThirdPartyAuth) {
      registerPage.find('input#password').simulate('change', { target: { value: payload.password, name: 'password' } });
    }
  };

  describe('TestRegistrationPage', () => {
    const emptyFieldValidation = {
      name: 'Enter your full name',
      username: 'Username must be between 2 and 30 characters',
      email: 'Enter your email',
      password: 'Password criteria has not been met',
      country: 'Select your country or region of residence',
    };

    const ssoProvider = {
      id: 'oa2-apple-id',
      name: 'Apple',
      iconClass: null,
      iconImage: 'https://edx.devstack.lms/logo.png',
      loginUrl: '/auth/login/apple-id/?auth_entry=login&next=/dashboard',
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
        is_authn_mfe: true,
        next: '/course/demo-course-url',
      };
      const nextProps = {
        registrationFormData: {
          country: 'PK',
        },
      };

      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      populateRequiredFields(registerPage, payload);
      registerPage.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
      registerPage.find('button.btn-brand').simulate('click');
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
        is_authn_mfe: true,
      };
      const nextProps = {
        registrationFormData: {
          country: 'PK',
        },
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
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      populateRequiredFields(registerPage, formPayload, true);
      registerPage.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
      registerPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...formPayload, country: 'PK' }));
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
      registrationPage.find('RegistrationPage').setState({ failureCount: 1 });

      expect(registrationPage.find('#validation-errors').first().text()).toEqual(alertBanner);
      expect(registrationPage.find('RegistrationPage').state('failureCount')).toEqual(1);
    });

    it('should update errors for frontend validations', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#name').simulate('blur', { target: { value: 'http://test.com', name: 'name' } });

      registrationPage.find('input#password').simulate('blur', { target: { value: 'pas', name: 'password' } });
      expect(registrationPage.find('RegistrationPage').state('errors')).toEqual({
        email: '', name: 'Enter a valid name', username: '', password: 'Password criteria has not been met', country: '',
      });

      registrationPage.find('input#password').simulate('blur', { target: { value: 'invalid-email', name: 'email' } });
      expect(registrationPage.find('RegistrationPage').state('errors')).toEqual({
        email: 'Enter a valid email address', name: 'Enter a valid name', username: '', password: 'Password criteria has not been met', country: '',
      });
    });

    it('should validate fields on blur event', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#username').simulate('blur', { target: { value: '', name: 'username' } });
      registrationPage.find('input#name').simulate('blur', { target: { value: '', name: 'name' } });
      registrationPage.find('input#email').simulate('blur', { target: { value: '', name: 'email' } });
      registrationPage.find('input#password').simulate('blur', { target: { value: '', name: 'password' } });
      registrationPage.find('input#country').simulate('blur', { target: { value: '', name: 'country' } });
      expect(registrationPage.find('RegistrationPage').state('errors')).toEqual(emptyFieldValidation);
    });

    it('should call validation api on blur event, if frontend validations have passed', () => {
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      // enter a valid username so that frontend validations are passed
      registrationPage.find('input#username').simulate('change', { target: { value: 'test', name: 'username' } });
      registrationPage.find('input#username').simulate('blur');

      const formPayload = {
        form_field_key: 'username',
        is_authn_mfe: true,
        email: '',
        name: '',
        username: 'test',
        password: '',
        country: '',
        honor_code: true,
      };
      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));
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
      expect(registrationPage.prop('validationDecisions')).toEqual({
        email: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account`,
        username: 'It looks like this username is already taken',
      });
    });

    it('should change validations in shouldComponentUpdate', () => {
      const formData = {
        errors: {
          ...registrationFormData.errors,
          username: 'It looks like this username is already taken',
        },
      };
      store.dispatch = jest.fn(store.dispatch);
      const nextProps = {
        thirdPartyAuthContext,
        registrationErrorCode: 'duplicate-username',
        validationDecisions: {
          username: 'It looks like this username is already taken',
        },
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');
      expect(registrationPage.instance().shouldComponentUpdate(nextProps)).toBe(false);
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData(formData, true));
      expect(registrationPage.state('errorCode')).toEqual('duplicate-username');
    });

    it('should remove space from the start of username', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#username').simulate('change', { target: { value: ' edX', name: 'username' } });

      expect(registrationPage.find('input#username').prop('value')).toEqual('edX');
    });

    // ******** test field focus in functionality ********

    it('should clear field related error messages on input field Focus', () => {
      const errors = {
        email: '',
        name: '',
        username: '',
        password: '',
        country: '',
      };
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="name"]').text()).toEqual(emptyFieldValidation.name);
      registrationPage.find('input#name').simulate('focus');
      expect(registrationPage.find('div[feedback-for="username"]').text()).toEqual(emptyFieldValidation.username);
      registrationPage.find('input#username').simulate('focus');
      expect(registrationPage.find('div[feedback-for="email"]').text()).toEqual(emptyFieldValidation.email);
      registrationPage.find('input#email').simulate('focus');
      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);
      registrationPage.find('input#password').simulate('focus');
      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);
      registrationPage.find('input#country').simulate('focus');
      expect(registrationPage.find('RegistrationPage').state('errors')).toEqual(errors);
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

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registerPage.find('#tpa-alert').find('p').text()).toEqual(expectedMessage);
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

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('RegistrationPage').instance().shouldComponentUpdate(props);
      expect(registerPage.find('button.username-suggestion').length).toEqual(3);
    });

    it('should show username suggestions when full name is populated', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['testname', 't.name', 'test_0'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });

      expect(registerPage.find('button.username-suggestion').length).toEqual(3);
    });

    it('should clear username suggestions when close icon is clicked', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['testname', 't.name', 'test_0'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('RegistrationPage').instance().shouldComponentUpdate(props);
      registerPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });
      registerPage.find('button.suggested-username-close-button').at(0).simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(clearUsernameSuggestions());
    });

    it('should redirect to url returned in registration result after successful account creation', () => {
      const dasboardUrl = 'http://test.com/testing-dashboard/';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
            redirectUrl: dasboardUrl,
          },
        },
      });
      delete window.location;
      window.location = { href: getConfig().BASE_URL };
      renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(window.location.href).toBe(dasboardUrl);
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
      window.location = { href: getConfig().BASE_URL.concat('/login'), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };
      ssoProvider.iconImage = null;

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registerPage.find(`button#${ssoProvider.id}`).find('span').text()).toEqual(ssoProvider.name);
      expect(registerPage.find(`button#${ssoProvider.id}`).hasClass(`btn-tpa btn-${ssoProvider.id}`)).toEqual(true);
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
      window.location = { href: getConfig().BASE_URL.concat('/register'), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };
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
      window.location = { href: getConfig().BASE_URL.concat('/login'), search: '?next=/dashboard&tpa_hint=invalid' };
      ssoProvider.iconImage = null;

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registerPage.find(`button#${ssoProvider.id}`).find('span#provider-name').text()).toEqual(expectedMessage);
    });

    // ******** miscellaneous tests ********

    it('tests componentDidMount calls the reset form action', () => {
      store.dispatch = jest.fn(store.dispatch);
      mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(store.dispatch).toHaveBeenCalledWith(resetRegistrationForm());
    });

    it('should render cookie banner', () => {
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registerPage.find(<CookiePolicyBanner />)).toBeTruthy();
    });

    it('should send page event when register page is rendered', () => {
      mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(analytics.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'register');
    });

    it('should send track event for save_for_later param', () => {
      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat('/register'), search: '?save_for_later=true' };
      renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.saveforlater.course.enroll.clicked',
        { category: 'save-for-later' });
    });

    // ******** shouldComponentUpdate tests ********

    it('should populate form with pipeline user details', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            pipelineUserDetails: {
              email: 'test@example.com',
            },
            countryCode: 'US',
          },
        },
      });
      const nextProps = {
        thirdPartyAuthContext: {
          pipelineUserDetails: {},
        },
        registrationFormData: {
          ...registrationFormData,
          country: 'US',
          email: 'test@example.com',
        },
        validationDecisions: null,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');
      registrationPage.instance().shouldComponentUpdate(nextProps);
      expect(registrationPage.state('country')).toEqual('US');
      expect(registrationPage.state('email')).toEqual('test@example.com');
    });

    it('should update state from country code present in redux store', () => {
      const nextProps = {
        registrationErrorCode: null,
        thirdPartyAuthContext: {
          ...thirdPartyAuthContext,
          countryCode: 'US',
        },
        registrationFormData: {
          ...registrationFormData,
          country: 'US',
        },
        validationDecisions: null,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      const shouldUpdate = registrationPage.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
      expect(registrationPage.find('RegistrationPage').state('country')).toEqual('US');
      expect(shouldUpdate).toBe(false);
    });

    it('should update error code state with error returned by registration api', () => {
      const nextProps = {
        registrationErrorCode: INTERNAL_SERVER_ERROR,
        thirdPartyAuthContext,
        validationDecisions: {},
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);

      expect(registrationPage.find('RegistrationPage').state('errorCode')).toEqual(INTERNAL_SERVER_ERROR);
    });

    it('should update form fields state if updated in redux store', () => {
      const nextProps = {
        thirdPartyAuthContext,
        registrationFormData: {
          name: 'John Doe',
          username: 'john_doe',
          email: 'john.doe@example.com',
          password: 'password1',
          emailErrorSuggestion: 'test@gmail.com',
        },
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);

      expect(registrationPage.find('RegistrationPage').state('name')).toEqual('John Doe');
      expect(registrationPage.find('RegistrationPage').state('username')).toEqual('john_doe');
      expect(registrationPage.find('RegistrationPage').state('email')).toEqual('john.doe@example.com');
      expect(registrationPage.find('RegistrationPage').state('emailErrorSuggestion')).toEqual('test@gmail.com');
      expect(registrationPage.find('RegistrationPage').state('password')).toEqual('password1');
    });

    it('should display opt-in/opt-out checkbox', () => {
      mergeConfig({
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registerPage.find('div.opt-checkbox').length).toEqual(1);

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    // ******** persist state tests ********

    it('should clear form field errors in redux store on onFocus', () => {
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#name').simulate('focus');
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData({ errors: registrationFormData.errors }));
    });

    it('should set username in redux store if usernameSuggestion is clicked', () => {
      const formData = {
        username: 'testname',
        errors: {
          ...registrationFormData.errors,
        },
      };
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['testname', 't.name', 'test_0'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });

      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });
      registerPage.find('button.username-suggestion').at(0).simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData(formData));
    });

    it('should set email in redux store if emailSuggestion is clicked', () => {
      const formData = {
        email: 'test@gmail.com',
        emailErrorSuggestion: null,
        emailWarningSuggestion: null,
        emailFieldBorderClass: '',
        errors: {
          ...registrationFormData.errors,
        },
      };
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
        },
      });
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#email').simulate('blur', { target: { value: 'test@gmail.con', name: 'email' } });
      registrationPage.find('RegistrationPage').setState({ emailErrorSuggestion: 'test@gmail.com' });
      registrationPage.find('.alert-link').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData(formData));
    });

    it('should clear username in redux store if usernameSuggestion close button is clicked', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['testname', 't.name', 'test_0'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });
      registerPage.find('button.suggested-username-close-button').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData({ username: '' }));
    });

    it('should clear emailErrorSuggestion in redux store if close button is clicked', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
        },
      });
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#email').simulate('blur', { target: { value: 'test@gmail.con', name: 'email' } });
      registrationPage.find('RegistrationPage').setState({ emailErrorSuggestion: 'test@gmail.com' });
      registrationPage.find('.alert-close').at(0).simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData({ emailErrorSuggestion: null }));
    });

    it('should set error in redux store if form field is invalid', () => {
      const formData = {
        name: '',
        errors: {
          ...registrationFormData.errors,
          name: emptyFieldValidation.name,
        },
      };
      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('input#name').simulate('blur', { target: { value: '', name: 'name' } });
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData(formData));
    });

    it('should set country code in redux store on country field blur', () => {
      const formData = {
        country: 'PK',
        errors: {
          country: '',
          email: '',
          name: '',
          password: '',
          username: '',
        },
      };
      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('RegistrationPage').setState({ country: 'PK' });
      registerPage.find('input#country').simulate('blur');
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData(formData));
    });

    it('should set country value with field error in redux store on country field blur', () => {
      const formData = {
        country: 'test',
        errors: {
          country: 'Select your country or region of residence',
          email: '',
          name: '',
          password: '',
          username: '',
        },
      };
      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('RegistrationPage').setState({ country: 'test' });
      registerPage.find('input#country').simulate('blur');
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData(formData));
    });

    it('should set country in component state on country change', () => {
      registrationFormData = {
        ...registrationFormData,
        country: 'PK',
      };
      const nextProps = {
        registrationFormData: {
          country: 'PK',
        },
      };

      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('input#country').simulate('change', { target: { value: 'Pakistan', name: 'country' } });
      registerPage.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
      expect(registerPage.find('RegistrationPage').state('country')).toEqual('PK');
    });

    it('should set country in component state on country change with translations', () => {
      getLocale.mockImplementation(() => ('ar-ae'));
      registrationFormData = {
        errors: { ...registrationFormData.errors },
        country: 'AF',
      };
      store.dispatch = jest.fn(store.dispatch);

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('input#country').simulate('focus');
      registerPage.find('button.dropdown-item').at(0).simulate('click', { target: { value: 'أفغانستان ', name: 'countryItem' } });
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData(registrationFormData));
    });

    it('should set country in component state on country change with chrome translations', () => {
      getLocale.mockImplementation(() => ('en-us'));
      registrationFormData = {
        errors: { ...registrationFormData.errors },
        country: 'AF',
      };
      store.dispatch = jest.fn(store.dispatch);

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('input#country').simulate('focus');
      registerPage.find('button.dropdown-item').at(0).simulate('click', { target: { value: undefined, name: undefined, parentElement: { parentElement: { value: 'Afghanistan' } } } });
      expect(store.dispatch).toHaveBeenCalledWith(setRegistrationFormData(registrationFormData));
    });
  });

  describe('TestDynamicFields', () => {
    it('should render fields returned by backend', () => {
      mergeConfig({
        ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
      });
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            country: { name: 'country', error_message: true },
            profession: { name: 'profession', type: 'text', label: 'Profession' },
            honor_code: { name: FIELDS.HONOR_CODE, error_message: 'You must agree to Honor Code of our site' },
            terms_of_service: {
              name: FIELDS.TERMS_OF_SERVICE,
              error_message: 'You must agree to the Terms and Service agreement of our site',
            },
          },
        },
      });
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registerPage.find('#country').exists()).toBeTruthy();
      expect(registerPage.find('#profession').exists()).toBeTruthy();
      expect(registerPage.find('#honor-code').exists()).toBeTruthy();
      expect(registerPage.find('#tos').exists()).toBeTruthy();
    });

    it('should submit form with fields returned by backend in payload', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            country: { name: 'country', error_message: true },
            profession: { name: 'profession', type: 'text', label: 'Profession' },
            honor_code: { name: 'honor_code', type: 'tos_and_honor_code' },
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
        totalRegistrationTime: 0,
        is_authn_mfe: true,
        honor_code: true,
        extended_profile: [{ field_name: 'profession', field_value: 'Engineer' }],
      };

      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      populateRequiredFields(registerPage, payload);
      registerPage.find('RegistrationPage').setState({ values: { country: 'PK' } });
      registerPage.find('input#profession').simulate('change', { target: { value: 'Engineer', name: 'profession' } });
      registerPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));
    });

    it('should show error message for fields returned by backend', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: {
              name: 'profession', type: 'text', label: 'Profession', error_message: 'Enter profession',
            },
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('#profession-error').last().text()).toEqual('Enter profession');
    });

    it('should show error message for confirm email field returned by backend', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            confirm_email: {
              name: 'confirm_email', type: 'text', label: 'Confirm Email', error_message: 'Enter your confirm email',
            },
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('#confirm_email-error').last().text()).toEqual('Enter your confirm email');
    });

    it('should show error if email and confirm email fields not match', () => {
      mergeConfig({
        ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
      });

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
      registrationPage.find('RegistrationPage').setState({ email: 'test1@gmail.com' });
      registrationPage.find('input#confirm_email').simulate('blur', { target: { value: 'test@gmail.com', name: 'confirm_email' } });

      expect(registrationPage.find('#confirm_email-error').last().text()).toEqual('The email addresses do not match.');
    });

    it('should redirect to dashboard if features flags are configured but no optional fields are configured', () => {
      mergeConfig({
        ENABLE_PROGRESSIVE_PROFILING: true,
        ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
      });
      const dasboardUrl = 'http://test.com/testing-dashboard/';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
            redirectUrl: dasboardUrl,
          },
          commonComponents: {
            optionalFields: {},
          },
        },
      });
      delete window.location;
      window.location = { href: getConfig().BASE_URL };
      renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(window.location.href).toBe(dasboardUrl);
    });

    it('should redirect to welcome page when optional fields are configured with feature flags', () => {
      mergeConfig({
        ENABLE_PROGRESSIVE_PROFILING: true,
        ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
      });
      store = mockStore({
        ...initialState,
        commonComponents: {
          optionalFields: {
            country: { name: 'country', error_message: false },
          },
        },
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
          },

        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL + WELCOME_PAGE };
      renderer.create(reduxWrapper(
        <IntlProvider locale="en">
          <MemoryRouter>
            <Provider store={store}><IntlRegistrationPage {...props} /></Provider>
          </MemoryRouter>
        </IntlProvider>,
      ));
      expect(window.location.href).toBe(getConfig().BASE_URL + WELCOME_PAGE);
    });
  });
});
