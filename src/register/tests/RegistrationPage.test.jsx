import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { getConfig } from '@edx/frontend-platform';
import { IntlProvider, injectIntl, configure } from '@edx/frontend-platform/i18n';
import * as analytics from '@edx/frontend-platform/analytics';
import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';

import RegistrationPage from '../RegistrationPage';
import { RenderInstitutionButton } from '../../common-components';
import RegistrationFailureMessage from '../RegistrationFailure';
import { PENDING_STATE } from '../../data/constants';
import { INTERNAL_SERVER_ERROR } from '../../login/data/constants';
import { fetchRegistrationForm, fetchRealtimeValidations, registerNewUser } from '../data/actions';

jest.mock('@edx/frontend-platform/analytics');

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();

const IntlRegistrationPage = injectIntl(RegistrationPage);
const IntlRegistrationFailure = injectIntl(RegistrationFailureMessage);
const mockStore = configureStore();

describe('./RegistrationPage.js', () => {
  const initialState = {
    register: {
      registrationResult: { success: false, redirectUrl: '' },
      registrationError: null,
      formData: {
        fields: [{
          label: 'I agree to the Your Platform Name Here <a href="/honor" rel="noopener" target="_blank">Honor Code</a>',
          name: 'honor_code',
          type: 'checkbox',
          errorMessages: {
            required: 'You must agree to the Your Platform Name Here Honor Code',
          },
          required: true,
        }],
      },
    },
    commonComponents: {
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        platformName: 'openedX',
        currentProvider: null,
        finishAuthUrl: null,
        providers: [],
        secondaryProviders: [],
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
  };

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore(initialState);
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: {
        'es-419': {},
        de: {},
        'en-us': {},
      },
    });
    props = {
      registrationResult: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show error messages on invalid extra fields', () => {
    const validationMessage = {
      honorCode: 'You must agree to the Your Platform Name Here Honor Code',
      country: 'Select your country or region of residence.',
    };
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        formData: {
          fields: [
            ...initialState.register.formData.fields,
            {
              label: 'The country or region where you live.',
              name: 'country',
              type: 'select',
              options: [{ value: '', name: '--' }, { value: 'AF', name: 'Afghanistan' }],
              errorMessages: {
                required: validationMessage.country,
              },
              required: true,
            },
          ],
        },
      },
    });
    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    registrationPage.find('input#honor_code').simulate('change', { target: { checked: false, name: 'honor_code', type: 'checkbox' } });
    registrationPage.update();
    expect(registrationPage.find('#honor_code-invalid-feedback').text()).toEqual(validationMessage.honorCode);

    registrationPage.find('select#country').simulate('change', { target: { checked: false, name: 'country', type: 'checkbox' } });
    registrationPage.update();
    expect(registrationPage.find('#country-invalid-feedback').text()).toEqual(validationMessage.country);
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
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        formData: {
          fields: [
            {
              label: 'Tell us why you\'re interested in edX',
              name: 'goals',
              type: 'textarea',
              required: false,
            },
            {
              label: 'Highest level of Education completed.',
              name: 'level_of_education',
              type: 'select',
              options: [{ value: '', name: '--' }, { value: 'p', name: 'Doctorate' }],
              required: false,
            },
            {
              label: 'Year of birth.',
              name: 'year_of_birth',
              type: 'select',
              options: [{ value: '', name: '--' }, { value: '2021', name: '2021' }],
              required: false,
            },
            {
              label: 'Gender.',
              name: 'gender',
              type: 'select',
              options: [{ value: '', name: '--' }, { value: 'f', name: 'Female' }],
              required: false,
            },
          ],
        },
      },
    });

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    registrationPage.find('input#optional').simulate('change', { target: { checked: true } });
    registrationPage.update();
    expect(registrationPage.find('textarea#goals').length).toEqual(1);
    expect(registrationPage.find('select#level_of_education').length).toEqual(1);
    expect(registrationPage.find('select#year_of_birth').length).toEqual(1);
    expect(registrationPage.find('select#gender').length).toEqual(1);
  });

  it('should dispatch fetchRegistrationForm on ComponentDidMount', () => {
    store.dispatch = jest.fn(store.dispatch);
    mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(store.dispatch).toHaveBeenCalledWith(fetchRegistrationForm());
  });

  it('should dispatch fetchRealtimeValidations on Blur', () => {
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

    registrationPage.find('input#username').simulate('blur', { target: { value: '', name: 'username' } });
    formPayload.fieldName = 'username';
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));

    registrationPage.find('input#name').simulate('blur', { target: { value: '', name: 'name' } });
    formPayload.fieldName = 'name';
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));

    registrationPage.find('input#email').simulate('blur', { target: { value: '', name: 'email' } });
    formPayload.fieldName = 'email';
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));

    registrationPage.find('input#password').simulate('blur', { target: { value: '', name: 'password' } });
    formPayload.fieldName = 'password';
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));
  });

  it('should call Validations function on Blur in case of 403', () => {
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        statusCode: 403,
      },
    });
    const errors = {
      email: 'Please enter your Email.',
      name: 'Please enter your Full Name.',
      username: 'Please enter your Public Username.',
      password: 'Please enter your Password.',
      country: '',
      honorCode: '',
      termsOfService: '',
    };

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    registrationPage.find('input#username').simulate('blur', { target: { value: '', name: 'username' } });
    registrationPage.find('input#name').simulate('blur', { target: { value: '', name: 'name' } });
    registrationPage.find('input#email').simulate('blur', { target: { value: '', name: 'email' } });
    registrationPage.find('input#password').simulate('blur', { target: { value: '', name: 'password' } });
    expect(registrationPage.find('RegistrationPage').state('errors')).toEqual(errors);
  });

  it('validate passwrod validations incsae of 403', () => {
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        statusCode: 403,
      },
    });
    const errors = {
      email: '',
      name: '',
      username: '',
      password: 'Your password must contain at least 8 characters',
      country: '',
      honorCode: '',
      termsOfService: '',
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
    const nextProps = {
      validations: {
        validation_decisions: {
          username: 'Username must be between 2 and 30 characters long.',
        },
      },
      thirdPartyAuthContext: {
        pipelineUserDetails: {
          name: 'test',
          email: 'test@example.com',
          username: 'test-username',
        },
      },
      registrationError: {
        username: [{ username: 'Username must be between 2 and 30 characters long.' }],
      },
    };

    const root = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    const shouldUpdate = root.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
    expect(root.find('RegistrationPage').state('currentValidations')).not.toEqual(null);
    expect(root.find('RegistrationPage').state('formValid')).not.toEqual(true);
    expect(shouldUpdate).toBe(false);
  });

  it('tests onClick should change errors state via realtime validation', () => {
    const nextProps = {
      validations: {
        validation_decisions: {
          username: 'Username must be between 2 and 30 characters long.',
        },
      },
    };

    const errors = {
      email: '',
      name: '',
      username: 'Username must be between 2 and 30 characters long.',
      password: '',
      country: '',
      honorCode: '',
      termsOfService: '',
    };

    const root = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    root.find('RegistrationPage').instance().shouldComponentUpdate(nextProps);
    root.find('input#username').simulate('click', { target: { value: '', name: 'username' } });
    expect(root.find('RegistrationPage').state('errors')).toEqual(errors);
  });

  it('should not dispatch registerNewUser on Submit', () => {
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

  it('should match default section snapshot', () => {
    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should match internal server error message', () => {
    props = {
      errors: {
        errorCode: INTERNAL_SERVER_ERROR,
      },
    };

    const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
    expect(registrationPage.find('div.alert-heading').length).toEqual(1);
    const expectedMessage = 'We couldn\'t create your account.An error has occurred. Try refreshing the page, or check your Internet connection.';
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
          currentProvider: 'Google',
        },
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
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
    window.location = { href: '' };
    renderer.create(reduxWrapper(<IntlRegistrationPage />));
    expect(window.location.href).toBe(dasboardUrl);
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
    window.location = { href: '' };

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
      register: {
        ...initialState.register,
        formData: {
          fields: [{
            label: 'I agree to the Your Platform Name Here <a href="/honor" rel="noopener" target="_blank">Honor Code</a>',
            name: 'honor_code',
            type: 'checkbox',
            errorMessages: {
              required: 'You must agree to the Your Platform Name Here Honor Code',
            },
          }],
        },
      },
    });

    delete window.location;
    window.location = { href: '' };

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

  it('should show error message on 409 on alert and below the fields', () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      scrollTo: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    store = mockStore({
      ...initialState,
      register: {
        ...initialState.register,
        isSubmitted: true,
        registrationError: {
          email: [
            {
              user_message: 'It looks like test@gmail.com belongs to an existing account. Try again with a different email address.',
            },
          ],
          username: [
            {
              user_message: 'It looks like test belongs to an existing account. Try again with a different username.',
            },
          ],
        },
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(tree.toJSON()).toMatchSnapshot();
    windowSpy.mockClear();
  });
});
