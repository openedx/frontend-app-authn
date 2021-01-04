import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { getConfig } from '@edx/frontend-platform';
import { IntlProvider, injectIntl, configure } from '@edx/frontend-platform/i18n';

import RegistrationPage from '../RegistrationPage';
import { RenderInstitutionButton } from '../InstitutionLogistration';
import { PENDING_STATE } from '../../data/constants';
import { fetchRegistrationForm, fetchRealtimeValidations, registerNewUser } from '../data/actions';

const IntlRegistrationPage = injectIntl(RegistrationPage);
const mockStore = configureStore();

describe('./RegistrationPage.js', () => {
  const initialState = {
    logistration: {
      registrationResult: { success: false, redirectUrl: '' },
      thirdPartyAuthContext: {
        platformName: 'openedX',
        currentProvider: null,
        finishAuthUrl: null,
        providers: [],
        secondaryProviders: [],
      },
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
      logistration: {
        ...initialState.logistration,
        formData: {
          fields: [
            ...initialState.logistration.formData.fields,
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

  it('should show optional fields section on optional check enabled', () => {
    store = mockStore({
      ...initialState,
      logistration: {
        ...initialState.logistration,
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
          ],
        },
      },
    });

    const registrationPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));

    registrationPage.find('input#optional').simulate('change', { target: { checked: true } });
    registrationPage.update();
    expect(registrationPage.find('textarea#goals').length).toEqual(1);
    expect(registrationPage.find('select#level_of_education').length).toEqual(1);
  });

  it('should dispatch fetchRegistrationForm on ComponentDidMount', () => {
    store = mockStore({
      ...initialState,
    });

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
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));

    registrationPage.find('input#name').simulate('blur', { target: { value: '', name: 'name' } });
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));

    registrationPage.find('input#email').simulate('blur', { target: { value: '', name: 'email' } });
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));

    registrationPage.find('input#password').simulate('blur', { target: { value: '', name: 'password' } });
    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations(formPayload));
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
    registrationPage.find('button.submit').simulate('click');
    expect(store.dispatch).not.toHaveBeenCalledWith(registerNewUser(formPayload));
  });

  it('should match default section snapshot', () => {
    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should match pending button state snapshot', () => {
    store = mockStore({
      ...initialState,
      logistration: {
        ...initialState.logistration,
        submitState: PENDING_STATE,
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('should match TPA provider snapshot', () => {
    store = mockStore({
      ...initialState,
      logistration: {
        ...initialState.logistration,
        thirdPartyAuthContext: {
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
      logistration: {
        ...initialState.logistration,
        thirdPartyAuthContext: {
          ...initialState.logistration.thirdPartyAuthContext,
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
      logistration: {
        ...initialState.logistration,
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
      logistration: {
        ...initialState.logistration,
        thirdPartyAuthContext: {
          ...initialState.logistration.thirdPartyAuthContext,
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
      logistration: {
        ...initialState.logistration,
        thirdPartyAuthContext: {
          ...initialState.logistration.thirdPartyAuthContext,
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
      logistration: {
        ...initialState.logistration,
        registrationResult: {
          success: true,
          redirectUrl: '',
        },
        thirdPartyAuthContext: {
          ...initialState.logistration.thirdPartyAuthContext,
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
      logistration: {
        ...initialState.logistration,
        thirdPartyAuthContext: {
          providers: [{
            ...appleProvider,
            registerUrl,
          }],
        },
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
      logistration: {
        ...initialState.logistration,
        thirdPartyAuthContext: {
          ...initialState.logistration.thirdPartyAuthContext,
          currentProvider: 'Apple',
        },
      },
    });

    const expectedMessage = 'You\'ve successfully signed into Apple. We just need a little more information before '
                            + 'you start learning with openedX.';

    const loginPage = mount(reduxWrapper(<IntlRegistrationPage {...props} />));
    expect(loginPage.find('#tpa-alert').find('span').text()).toEqual(expectedMessage);
  });

  it('should show error message on 409', () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      scrollTo: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    store = mockStore({
      ...initialState,
      logistration: {
        ...initialState.logistration,
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

    const tree = renderer.create(reduxWrapper(<IntlRegistrationPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
    windowSpy.mockClear();
  });
});
