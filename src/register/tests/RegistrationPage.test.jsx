import React from 'react';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';

import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import { IntlProvider, injectIntl, configure } from '@edx/frontend-platform/i18n';

import {
  clearUsernameSuggestions,
  fetchRealtimeValidations,
  registerNewUser,
  resetRegistrationForm,
} from '../data/actions';
import { FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR, TPA_SESSION_EXPIRED } from '../data/constants';
import RegistrationFailureMessage from '../RegistrationFailure';
import RegistrationPage from '../RegistrationPage';

import { COMPLETE_STATE, PENDING_STATE } from '../../data/constants';

jest.mock('@edx/frontend-platform/analytics');

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();

const IntlRegistrationPage = injectIntl(RegistrationPage);
const IntlRegistrationFailure = injectIntl(RegistrationFailureMessage);
const mockStore = configureStore();

describe('RegistrationPage', () => {
  mergeConfig({
    PRIVACY_POLICY: 'http://privacy-policy.com',
    REGISTRATION_OPTIONAL_FIELDS: 'gender,goals,levelOfEducation,yearOfBirth',
    TOS_AND_HONOR_CODE: 'http://tos-and-honot-code.com',
    USER_SURVEY_COOKIE_NAME: process.env.USER_SURVEY_COOKIE_NAME,
    REGISTER_CONVERSION_COOKIE_NAME: process.env.REGISTER_CONVERSION_COOKIE_NAME,
  });

  let props = {};
  let store = {};

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
    props = {
      registrationResult: jest.fn(),
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const populateRequiredFields = (registerPage, payload, isThirdPartyAuth = false) => {
    registerPage.find('input#name').simulate('change', { target: { value: payload.name, name: 'name' } });
    registerPage.find('input#username').simulate('change', { target: { value: payload.username, name: 'username' } });
    registerPage.find('input#email').simulate('change', { target: { value: payload.email, name: 'email' } });
    registerPage.find('input#country').simulate('change', { target: { value: payload.country } });

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
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        is_authn_mfe: true,
      };

      store.dispatch = jest.fn(store.dispatch);
      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      populateRequiredFields(registerPage, payload);
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

      registrationPage.find('input#password').simulate('blur', { target: { value: 'pas', name: 'password' } });
      expect(registrationPage.find('RegistrationPage').state('errors')).toEqual({
        email: '', name: '', username: '', password: 'Password criteria has not been met', country: '',
      });

      registrationPage.find('input#password').simulate('blur', { target: { value: 'invalid-email', name: 'email' } });
      expect(registrationPage.find('RegistrationPage').state('errors')).toEqual({
        email: 'Enter a valid email address', name: '', username: '', password: 'Password criteria has not been met', country: '',
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

    it('should validate the did you mean suggestions', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      registrationPage.find('input#email').simulate('blur', { target: { value: 'test@gmail.con', name: 'email' } });
      expect(registrationPage.find('RegistrationPage').state('emailErrorSuggestion')).toEqual('test@gmail.com');

      registrationPage.find('input#email').simulate('blur', { target: { value: 'test@fmail.com', name: 'email' } });
      expect(registrationPage.find('RegistrationPage').state('emailWarningSuggestion')).toEqual('test@gmail.com');

      registrationPage.find('input#email').simulate('blur', { target: { value: 'test@hotmail.com', name: 'email' } });
      expect(registrationPage.find('RegistrationPage').state('emailWarningSuggestion')).toEqual(null);
    });

    it('should update props with validations returned by registration api', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            username: [{ userMessage: 'It looks like this username is already taken' }],
            email: [{ userMessage: 'It looks like this email address is already registered' }],
          },
        },
      });
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');
      expect(registrationPage.prop('validationDecisions')).toEqual({
        country: '',
        email: 'It looks like this email address is already registered',
        name: '',
        password: '',
        username: 'It looks like this username is already taken',
      });
    });

    it('should change validations in shouldComponentUpdate', () => {
      const nextProps = {
        thirdPartyAuthContext,
        registrationErrorCode: 'duplicate-username',
        validationDecisions: {
          username: 'It looks like this username is already taken',
        },
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');
      expect(registrationPage.instance().shouldComponentUpdate(nextProps)).toBe(false);
      expect(registrationPage.state('errors').username).toEqual('It looks like this username is already taken');
      expect(registrationPage.state('errorCode')).toEqual('duplicate-username');
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
      registrationPage.find('input#country').simulate('blur', { target: { value: 'US', name: 'country' } });
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

      const expectedMessage = 'You\'ve successfully signed into Apple! We just need a little more information before '
                              + 'you start learning with edX.';

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
      expect(registrationPage.find('button[type="submit"] span').first().text()).toEqual('Create an account');
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
        },
      });

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registerPage.find('RegistrationPage').setState({ errors: { username: 'It looks like this username is already taken' } });

      expect(registerPage.find('button.username-suggestion').length).toEqual(3);
      registerPage.find('button.username-suggestion').at(0).simulate('click');
      expect(registerPage.find('RegistrationPage').state('username')).toEqual('test_1');
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

    // ******** shouldComponentUpdate tests ********

    it('should populate form with pipeline user details', () => {
      const nextProps = {
        registrationErrorCode: null,
        thirdPartyAuthContext: {
          pipelineUserDetails: {
            email: 'test@example.com',
          },
          countryCode: 'US',
        },
        validationDecisions: null,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />)).find('RegistrationPage');
      registrationPage.instance().shouldComponentUpdate(nextProps);

      expect(registrationPage.state('country')).toEqual('US');
      expect(registrationPage.state('email')).toEqual('test@example.com');
    });

    it('should update state if country code is present in context', () => {
      const nextProps = {
        registrationErrorCode: null,
        thirdPartyAuthContext: {
          ...thirdPartyAuthContext,
          countryCode: 'US',
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
        validationDecisions: null,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);

      expect(registrationPage.find('RegistrationPage').state('errorCode')).toEqual(INTERNAL_SERVER_ERROR);
    });
  });

  describe('TestOptionalFields', () => {
    it('should toggle optional fields state', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      registrationPage.find('input#optional-field-checkbox').simulate('click', { target: { name: 'optionalFields', checked: true } });
      expect(registrationPage.find('RegistrationPage').state('showOptionalField')).toEqual(true);

      // it should also works when change is made directly instead of click
      registrationPage.find('input#optional-field-checkbox').simulate('change', { target: { name: 'optionalFields', checked: false } });
      expect(registrationPage.find('RegistrationPage').state('showOptionalField')).toEqual(false);
    });

    it('should show optional fields section on optional check enabled', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      registrationPage.find('input#optional-field-checkbox').simulate('change', { target: { name: 'optionalFields', checked: true } });
      registrationPage.update();

      expect(registrationPage.find('textarea#goals').length).toEqual(1);
      expect(registrationPage.find('select#levelOfEducation').length).toEqual(1);
      expect(registrationPage.find('select#yearOfBirth').length).toEqual(1);
      expect(registrationPage.find('select#gender').length).toEqual(1);
    });

    it('should show optional field check based on environment variable', () => {
      mergeConfig({
        REGISTRATION_OPTIONAL_FIELDS: '',
      });
      let registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('input#optional-field-checkbox').length).toEqual(0);

      mergeConfig({
        REGISTRATION_OPTIONAL_FIELDS: 'gender,goals,levelOfEducation,yearOfBirth',
      });

      registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      expect(registrationPage.find('input#optional-field-checkbox').length).toEqual(1);
    });

    it('send tracking event on optional checkbox enabled', () => {
      const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

      registrationPage.find('input#optional-field-checkbox').simulate('change', { target: { name: 'optionalFields', checked: true } });
      expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.register.optional_fields_selected', {});
    });

    it('should submit form with optional fields', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'password1',
        country: 'Pakistan',
        gender: 'm',
        year_of_birth: '1997',
        level_of_education: 'other',
        goals: 'edX goals',
        honor_code: true,
        totalRegistrationTime: 0,
        is_authn_mfe: true,
      };

      store.dispatch = jest.fn(store.dispatch);
      delete window.location;
      window.location = { href: getConfig().BASE_URL };

      const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
      populateRequiredFields(registerPage, payload);

      // submit optional fields
      registerPage.find('input#optional-field-checkbox').simulate('change', { target: { name: 'optionalFields', checked: true } });
      registerPage.find('select#gender').simulate('change', { target: { value: 'm', name: 'gender' } });
      registerPage.find('select#yearOfBirth').simulate('change', { target: { value: '1997', name: 'yearOfBirth' } });
      registerPage.find('select#levelOfEducation').simulate('change', { target: { value: 'other', name: 'levelOfEducation' } });
      registerPage.find('textarea#goals').simulate('change', { target: { value: 'edX goals', name: 'goals' } });

      registerPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));
    });
  });
});
