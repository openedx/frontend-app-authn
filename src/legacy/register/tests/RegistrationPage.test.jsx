import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { IntlProvider, injectIntl, configure } from '@edx/frontend-platform/i18n';
import * as analytics from '@edx/frontend-platform/analytics';
import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';

import RegistrationPage from '../RegistrationPage';
import { RenderInstitutionButton } from '../../common-components';
import RegistrationFailureMessage from '../RegistrationFailure';
import { COMPLETE_STATE, PENDING_STATE } from '../../data/constants';
import { fetchRealtimeValidations, registerNewUser } from '../data/actions';
import { FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR } from '../data/constants';

jest.mock('@edx/frontend-platform/analytics');

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();

const IntlRegistrationPage = injectIntl(RegistrationPage);
const IntlRegistrationFailure = injectIntl(RegistrationFailureMessage);
const mockStore = configureStore();

describe('RegistrationPageTests', () => {
  mergeConfig({
    PRIVACY_POLICY: 'http://privacy-policy.com',
    REGISTRATION_OPTIONAL_FIELDS: 'gender,goals,level_of_education,year_of_birth',
    TOS_AND_HONOR_CODE: 'http://tos-and-honot-code.com',
    USER_SURVEY_COOKIE_NAME: process.env.USER_SURVEY_COOKIE_NAME,
    REGISTER_CONVERSION_COOKIE_NAME: process.env.REGISTER_CONVERSION_COOKIE_NAME,
  });

  const initialState = {
    register: {
      registrationResult: { success: false, redirectUrl: '' },
      registrationError: null,
    },
    commonComponents: {
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        platformName: 'openedX',
        currentProvider: null,
        finishAuthUrl: null,
        providers: [],
        secondaryProviders: [],
        pipelineUserDetails: null,
      },
    },
  };

  let props = {};
  let store = {};

  const appleProvider = {
    id: 'oa2-apple-id',
    name: 'Apple',
    iconClass: null,
    iconImage: 'https://edx.devstack.lms/logo.png',
    loginUrl: '/auth/login/apple-id/?auth_entry=login&next=/dashboard',
  };

  const secondaryProviders = {
    id: 'saml-test',
    name: 'Test University',
    loginUrl: '/dummy-auth',
    registerUrl: '/dummy_auth',
    skipHintedLogin: false,
  };

  const emptyFieldValidation = {
    name: 'Please enter your full name.',
    username: 'Please enter your public username.',
    email: 'Please enter your email.',
    password: 'Please enter your password.',
    country: 'Select your country or region of residence.',
  };

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const submitForm = (payload, submitOptionalFields = true, isThirdPartyAuth = false) => {
    const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    registerPage.find('input#name').simulate('change', { target: { value: payload.name, name: 'name' } });
    registerPage.find('input#username').simulate('change', { target: { value: payload.username, name: 'username' } });
    registerPage.find('input#email').simulate('change', { target: { value: payload.email, name: 'email' } });
    registerPage.find('select#country').simulate('change', { target: { value: payload.country, name: 'country' } });

    if (!isThirdPartyAuth) {
      registerPage.find('input#password').simulate('change', { target: { value: payload.password, name: 'password' } });
    }

    // Send optional field
    if (submitOptionalFields) {
      registerPage.find('input#optional').simulate('change', { target: { checked: true } });
      registerPage.find('select#gender').simulate('change', { target: { value: payload.gender || null, name: 'gender' } });
      registerPage.find('select#yearOfBirth').simulate('change', { target: { values: payload.yearOfBirth || null, name: 'yearOfBirth' } });
      registerPage.find('select#levelOfEducation').simulate('change', { target: { values: payload.levelOfEducation || null, name: 'levelOfEducation' } });
      registerPage.find('textarea#goals').simulate('change', { target: { value: payload.goals || '', name: 'goals' } });
    }

    registerPage.find('button.btn-brand').simulate('click');
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
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle optional fields state on checkbox click', () => {
    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    registrationPage.find('input#optional').simulate('change', { target: { checked: true } });
    expect(registrationPage.find('RegistrationPage').state('enableOptionalField')).toEqual(true);
  });

  it('should toggle optional fields state on text click', () => {
    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    registrationPage.find('#additionalFields').simulate('click');
    expect(registrationPage.find('RegistrationPage').state('enableOptionalField')).toEqual(true);
  });

  it('send tracking event on optional checkbox enabled', () => {
    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    registrationPage.find('input#optional').simulate('change', { target: { checked: true } });
    registrationPage.update();
    expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.register.optional_fields_selected', {});
  });

  it('send tracking event when login link is clicked', () => {
    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    registrationPage.find('a[href*="/login"]').simulate('click');
    registrationPage.update();
    expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.login_form.toggled', { category: 'user-engagement' });
  });

  it('send page event when register page is rendered', () => {
    mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(analytics.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'register');
  });

  it('should show optional fields section on optional check enabled', () => {
    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('input#optional').simulate('change', { target: { checked: true } });
    registrationPage.update();

    expect(registrationPage.find('textarea#goals').length).toEqual(1);
    expect(registrationPage.find('select#levelOfEducation').length).toEqual(1);
    expect(registrationPage.find('select#yearOfBirth').length).toEqual(1);
    expect(registrationPage.find('select#gender').length).toEqual(1);
  });

  it('should not show optional field check if process env has empty optional fields list', () => {
    mergeConfig({
      REGISTRATION_OPTIONAL_FIELDS: '',
    });
    let registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(registrationPage.find('input#optional').length).toEqual(0);

    mergeConfig({
      REGISTRATION_OPTIONAL_FIELDS: 'gender,goals,level_of_education,year_of_birth',
    });

    registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(registrationPage.find('input#optional').length).toEqual(1);
  });

  it('should dispatch fetchRealtimeValidations on Blur after frontend validations ', () => {
    const formPayload = {
      email: '',
      name: '',
      username: 'test',
      password: '',
      country: '',
      honor_code: true,
    };
    store.dispatch = jest.fn(store.dispatch);

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    IntlRegistrationPage.prototype.componentDidMount = jest.fn();
    registrationPage.find('input#username').simulate('change', { target: { value: 'test', name: 'username' } });
    registrationPage.find('input#username').simulate('blur');
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));

    registrationPage.find('input#email').simulate('change', { target: { value: 'test@test.com', name: 'email' } });
    registrationPage.find('input#email').simulate('blur');
    formPayload.email = 'test@test.com';
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));

    registrationPage.find('input#password').simulate('change', { target: { value: 'random123', name: 'password' } });
    registrationPage.find('input#password').simulate('blur');
    formPayload.password = 'random123';

    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));
  });

  it('should call validations function on Blur', () => {
    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('input#username').simulate('blur', { target: { value: '', name: 'username' } });
    registrationPage.find('input#name').simulate('blur', { target: { value: '', name: 'name' } });
    registrationPage.find('input#email').simulate('blur', { target: { value: '', name: 'email' } });
    registrationPage.find('input#password').simulate('blur', { target: { value: '', name: 'password' } });
    registrationPage.find('select#country').simulate('blur', { target: { value: '', name: 'country' } });
    expect(registrationPage.find('RegistrationPage').state('errors')).toEqual(emptyFieldValidation);
  });

  it('validate password validations', () => {
    const errors = {
      email: '',
      name: '',
      username: '',
      password: 'Your password must contain at least 8 characters',
      country: '',
    };

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('input#password').simulate('blur', { target: { value: 'pas', name: 'password' } });
    expect(registrationPage.find('RegistrationPage').state('errors')).toEqual(errors);

    errors.password = 'Your password must contain at least 1 number.';
    registrationPage.find('input#password').simulate('blur', { target: { value: 'passwordd', name: 'password' } });
    expect(registrationPage.find('RegistrationPage').state('errors')).toEqual(errors);

    errors.password = 'Your password must contain at least 1 letter.';
    registrationPage.find('input#password').simulate('blur', { target: { value: '123456789', name: 'password' } });
    expect(registrationPage.find('RegistrationPage').state('errors')).toEqual(errors);
  });

  it('tests shouldComponentUpdate change validations and formValid state', () => {
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        updateFieldErrors: false,
      },
    });
    const nextProps = {
      validations: {
        validation_decisions: {
          username: 'Username must be between 2 and 30 characters long.',
        },
      },
      registrationError: {
        username: [{ username: 'Username must be between 2 and 30 characters long.' }],
      },
    };

    const root = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    // calling this to update the state
    root.find('input#username').simulate('blur', { target: { value: '', name: 'username' } });
    const shouldUpdate = root.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
    expect(root.find('RegistrationPage').state('formValid')).not.toEqual(true);
    expect(shouldUpdate).toBe(false);
  });

  it('should not dispatch registerNewUser on empty form Submission', () => {
    const formPayload = {
      email: '',
      username: '',
      password: '',
      name: '',
      honor_code: true,
      country: '',
    };
    store.dispatch = jest.fn(store.dispatch);

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('button.btn-brand').simulate('click');
    expect(store.dispatch).not.toHaveBeenCalledWith(registerNewUser(formPayload));
  });

  it('should show error messages for required fields on empty form submission', () => {
    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('button.btn-brand').simulate('click');

    expect(registrationPage.find('#name-invalid-feedback').text()).toEqual(emptyFieldValidation.name);
    expect(registrationPage.find('#username-invalid-feedback').text()).toEqual(emptyFieldValidation.username);
    expect(registrationPage.find('#email-invalid-feedback').text()).toEqual(emptyFieldValidation.email);
    expect(registrationPage.find('#password-invalid-feedback').text()).toEqual(emptyFieldValidation.password);
    expect(registrationPage.find('#country-invalid-feedback').text()).toEqual(emptyFieldValidation.country);

    let alertBanner = 'We couldn\'t create your account.';
    Object.keys(emptyFieldValidation).forEach(key => {
      alertBanner += emptyFieldValidation[key];
    });

    expect(registrationPage.find('#validation-errors').first().text()).toEqual(alertBanner);
  });

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

    expect(registrationPage.find('#name-invalid-feedback').text()).toEqual(emptyFieldValidation.name);
    registrationPage.find('input#name').simulate('focus');
    expect(registrationPage.find('#username-invalid-feedback').text()).toEqual(emptyFieldValidation.username);
    registrationPage.find('input#username').simulate('focus');
    expect(registrationPage.find('#email-invalid-feedback').text()).toEqual(emptyFieldValidation.email);
    registrationPage.find('input#email').simulate('focus');
    expect(registrationPage.find('#password-invalid-feedback').text()).toEqual(emptyFieldValidation.password);
    registrationPage.find('input#password').simulate('focus');
    registrationPage.find('select#country').simulate('focus', { target: { value: 'US', name: 'country' } });
    expect(registrationPage.find('RegistrationPage').state('errors')).toEqual(errors);
  });

  it('should show error message on alert and below the fields in case of 409', () => {
    const errors = {
      email: 'It looks like test@gmail.com belongs to an existing account. Try again with a different email address.',
      username: 'It looks like test belongs to an existing account. Try again with a different username.',
    };
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        registrationError: {
          email: [{ user_message: errors.email }],
          username: [{ user_message: errors.username }],
        },
      },
    });

    const nextProps = {
      validations: null,
      thirdPartyAuthContext: {
        pipelineUserDetails: null,
      },
      registrationError: {
        username: [{ username: errors.username }],
      },
    };

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('button.btn-brand').simulate('click');
    registrationPage.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
    expect(registrationPage.find('#email-invalid-feedback').text()).toEqual(errors.email);
    expect(registrationPage.find('#username-invalid-feedback').text()).toEqual(errors.username);
    expect(registrationPage.find('#validation-errors').first().text()).toEqual(
      'We couldn\'t create your account.'.concat(errors.email + errors.username),
    );
  });

  it('should submit form for valid input', () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

    const formPayload = {
      name: 'John Doe',
      username: 'john_doe',
      email: 'john.doe@example.com',
      password: 'password1',
      country: 'Pakistan',
      gender: 'm',
      honor_code: true,
      totalRegistrationTime: 0,
    };

    store.dispatch = jest.fn(store.dispatch);
    submitForm(formPayload);
    expect(store.dispatch).toHaveBeenCalledWith(registerNewUser(formPayload));
  });

  it('should submit form with no password when current provider is present', () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          currentProvider: appleProvider.name,
        },
      },
    });

    const formPayload = {
      name: 'John Doe',
      username: 'john_doe',
      email: 'john.doe@example.com',
      country: 'Pakistan',
      honor_code: true,
      social_auth_provider: appleProvider.name,
      totalRegistrationTime: 0,
    };

    store.dispatch = jest.fn(store.dispatch);
    submitForm(formPayload, false, true);
    expect(store.dispatch).toHaveBeenCalledWith(registerNewUser(formPayload));
  });

  it('should display validationAlertMessages in case of invalid form submission', () => {
    const alertMessages = {
      name: [{ user_message: 'Please enter your full name.' }],
      username: [{ user_message: 'Please enter your public username.' }],
      email: [{ user_message: 'Please enter your email.' }],
      password: [{ user_message: 'Please enter your password.' }],
      country: [{ user_message: 'Select your country or region of residence.' }],
    };
    store.dispatch = jest.fn(store.dispatch);

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('button.btn-brand').simulate('click');
    expect(registrationPage.find('RegistrationPage').state('validationAlertMessages')).toEqual(alertMessages);
  });

  it('should not update validationAlertMessages on blur event', () => {
    const alertMessages = {
      name: [{ user_message: 'Please enter your full name.' }],
      username: [{ user_message: 'Please enter your public username.' }],
      email: [{ user_message: 'Please enter your email.' }],
      password: [{ user_message: 'Please enter your password.' }],
      country: [{ user_message: 'Select your country or region of residence.' }],
    };
    store.dispatch = jest.fn(store.dispatch);

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('button.btn-brand').simulate('click');
    expect(registrationPage.find('RegistrationPage').state('validationAlertMessages')).toEqual(alertMessages);

    registrationPage.find('input#password').simulate('blur', { target: { value: 'test12345', name: 'password' } });
    registrationPage.find('input#email').simulate('blur', { target: { value: 'test@test.com', name: 'email' } });
    registrationPage.find('input#name').simulate('blur', { target: { value: 'test', name: 'name' } });

    expect(registrationPage.find('RegistrationPage').state('validationAlertMessages')).toEqual(alertMessages);
  });

  it('should match default section snapshot', () => {
    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should match registration api rate limit error message', () => {
    props = {
      errors: {
        errorCode: FORBIDDEN_REQUEST,
      },
    };

    const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
    expect(registrationPage.find('div.alert-heading').length).toEqual(1);
    const expectedMessage = 'We couldn\'t create your account.Too many failed registration attempts. Try again later.';
    expect(registrationPage.find('div.alert').first().text()).toEqual(expectedMessage);
  });

  it('should match internal server error message', () => {
    props = {
      errors: {
        errorCode: INTERNAL_SERVER_ERROR,
      },
    };

    const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
    expect(registrationPage.find('div.alert-heading').length).toEqual(1);
    const expectedMessage = 'We couldn\'t create your account.An error has occurred. Try refreshing the page, or check your internet connection.';
    expect(registrationPage.find('div.alert').first().text()).toEqual(expectedMessage);
  });

  it('should match pending button state snapshot', () => {
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        submitState: PENDING_STATE,
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should match TPA provider snapshot', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [appleProvider],
        },
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display no password field when current provider is present', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          currentProvider: appleProvider.name,
        },
      },
    });

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(registrationPage.find('input#password').length).toEqual(0);
  });

  it('tests shouldComponentUpdate with pipeline user data', () => {
    const nextProps = {
      validations: null,
      thirdPartyAuthContext: {
        pipelineUserDetails: {
          name: 'test',
          email: 'test@example.com',
          username: 'test-username',
        },
      },
    };

    const root = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    const shouldUpdate = root.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
    expect(shouldUpdate).toBe(false);
  });

  it('should match url after redirection', () => {
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
    renderer.create(reduxWrapper(<IntlRegistrationPage />));
    expect(window.location.href).toBe(dasboardUrl);
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

    renderer.create(reduxWrapper(<IntlRegistrationPage />));
    expect(document.cookie).toMatch(`${getConfig().USER_SURVEY_COOKIE_NAME}=register`);
    expect(document.cookie).toMatch(`${getConfig().REGISTER_CONVERSION_COOKIE_NAME}=true`);
  });

  it('should display institution register button', () => {
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
    expect(root.text().includes('Use my institution/campus credentials')).toBe(true);
  });

  it('should not display institution register button', () => {
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
    root.find(RenderInstitutionButton).simulate('click', { institutionLogin: true });
    expect(root.text().includes('Test University')).toBe(true);
  });

  it('should match url after TPA redirection', () => {
    const authCompleteUrl = '/auth/complete/google-oauth2/';
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        registrationResult: {
          success: true,
          redirectUrl: '',
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

  it('should redirect to social auth provider url', () => {
    const registerUrl = '/auth/login/apple-id/?auth_entry=register&next=/dashboard';
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [{
            ...appleProvider,
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

    const expectedMessage = 'You\'ve successfully signed into Apple. We just need a little more information before '
                            + 'you start learning with openedX.';

    const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(registerPage.find('#tpa-alert').find('span').text()).toEqual(expectedMessage);
  });

  it('check cookie rendered', () => {
    const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(registerPage.find(<CookiePolicyBanner />)).toBeTruthy();
  });

  it('should render tpa button for tpa_hint id in primary provider', () => {
    const expectedMessage = `Sign in using ${appleProvider.name}`;
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [appleProvider],
        },
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat('/register'), search: `?next=/dashboard&tpa_hint=${appleProvider.id}` };
    appleProvider.iconImage = null;

    const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(registerPage.find(`button#${appleProvider.id}`).find('span').text()).toEqual(expectedMessage);
  });

  it('should render regular tpa button for invalid tpa_hint value', () => {
    const expectedMessage = `${appleProvider.name}`;
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [appleProvider],
        },
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat('/register'), search: '?next=/dashboard&tpa_hint=invalid' };
    appleProvider.iconImage = null;

    const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(registerPage.find(`button#${appleProvider.id}`).find('span#provider-name').text()).toEqual(expectedMessage);
  });

  it('should render tpa button for tpa_hint id in secondary provider', () => {
    const expectedMessage = `Sign in using ${secondaryProviders.name}`;
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

    const registerPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(registerPage.find(`button#${secondaryProviders.id}`).find('span').text()).toEqual(expectedMessage);
  });

  it('should redirect to idp page if skipHinetedLogin is true', () => {
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
});
