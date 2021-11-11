import React from 'react';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';

import { loginRequest, loginRequestFailure, loginRequestReset } from '../data/actions';
import LoginFailureMessage from '../LoginFailure';
import LoginPage from '../LoginPage';

import { COMPLETE_STATE, PENDING_STATE } from '../../data/constants';

jest.mock('@edx/frontend-platform/analytics');

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();

const IntlLoginFailureMessage = injectIntl(LoginFailureMessage);
const IntlLoginPage = injectIntl(LoginPage);
const mockStore = configureStore();

describe('LoginPage', () => {
  mergeConfig({
    USER_SURVEY_COOKIE_NAME: process.env.USER_SURVEY_COOKIE_NAME,
  });
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </IntlProvider>
  );

  const initialState = {
    login: {
      loginResult: { success: false, redirectUrl: '' },
    },
    commonComponents: {
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        currentProvider: null,
        finishAuthUrl: null,
        providers: [],
        secondaryProviders: [],
      },
    },
  };

  const secondaryProviders = {
    id: 'saml-test',
    name: 'Test University',
    loginUrl: '/dummy-auth',
    registerUrl: '/dummy_auth',
    skipHintedLogin: false,
  };

  const ssoProvider = {
    id: 'oa2-apple-id',
    name: 'Apple',
    iconClass: null,
    iconImage: 'https://edx.devstack.lms/logo.png',
    loginUrl: '/auth/login/apple-id/?auth_entry=login&next=/dashboard',
  };

  beforeEach(() => {
    store = mockStore(initialState);
    props = {
      loginRequest: jest.fn(),
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
  });

  // ******** test login form submission ********

  it('should submit form for valid input', () => {
    store.dispatch = jest.fn(store.dispatch);
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#emailOrUsername').simulate('change', { target: { value: 'test@example.com' } });
    loginPage.find('input#password').simulate('change', { target: { value: 'password' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(store.dispatch).toHaveBeenCalledWith(loginRequest({ email_or_username: 'test@example.com', password: 'password' }));
  });

  it('should not dispatch loginRequest on empty form submission', () => {
    store.dispatch = jest.fn(store.dispatch);
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('button.btn-brand').simulate('click');
    expect(store.dispatch).not.toHaveBeenCalledWith(loginRequest({}));
  });

  // ******** test login form validations ********

  it('should match state on empty form submission', () => {
    const errorState = { emailOrUsername: 'Enter your username or email', password: 'Enter your password' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');
    loginPage.find('button.btn-brand').simulate('click');

    // Check that loginRequestFailure was dispatched and state is updated
    expect(loginPage.state('errors')).toEqual(errorState);
    expect(store.dispatch).toHaveBeenCalledWith(loginRequestFailure({ errorCode: 'invalid-form' }));
  });

  it('should match state for invalid email (less than 3 characters), on form submission', () => {
    const errorState = { emailOrUsername: 'Username or email must have at least 3 characters.', password: '' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');

    loginPage.find('input#password').simulate('change', { target: { value: 'test', name: 'password' } });
    loginPage.find('input#emailOrUsername').simulate('change', { target: { value: 'te', name: 'email' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.state('errors')).toEqual(errorState);
  });

  it('should reset field related error messages on onFocus event', () => {
    const errorState = { emailOrUsername: '', password: '' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');
    loginPage.find('button.btn-brand').simulate('click');

    loginPage.find('input#emailOrUsername').simulate('focus');
    loginPage.find('input#password').simulate('focus');
    expect(loginPage.state('errors')).toEqual(errorState);
  });

  // ******** test form buttons and links ********

  it('should match default button state', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('button[type="submit"] span').first().text()).toEqual(' Sign in ');
  });

  it('should match pending button state', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        submitState: PENDING_STATE,
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    const button = loginPage.find('button[type="submit"] span').first();

    expect(button.find('.sr-only').text()).toEqual(' pending ');
  });

  it('should show forgot password link', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('a#forgot-password').text()).toEqual('Forgot password');
  });

  it('should show single sign on provider button', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

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

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${ssoProvider.id}`).length).toEqual(1);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should not display institution login option when no secondary providers are present', () => {
    const root = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(root.text().includes('Use my university info')).toBe(false);
  });

  // ******** test alert messages ********

  it('should match login error message', () => {
    const errorMessage = 'Email or password is incorrect.';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginError: { value: errorMessage },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#login-failure-alert').first().text()).toEqual(`We couldn't sign you in.${errorMessage}`);
  });

  it('should match account activation message', () => {
    const activationMessage = 'Success! You have activated your account.'
                              + 'You will now receive email updates and alerts from us related '
                              + 'to the courses you are enrolled in. Sign in to continue.';

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat('/login'), search: '?account_activation_status=success' };

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('div#account-activation-message').text()).toEqual(activationMessage);
  });

  it('should match third party auth alert', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          currentProvider: 'Apple',
          platformName: 'edX',
        },
      },
    });

    const expectedMessage = 'You have successfully signed into Apple, but your Apple account does not have a '
                            + 'linked edX account. To link your accounts, sign in now using your edX password.';

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#tpa-alert').find('p').text()).toEqual(expectedMessage);
  });

  it('should match invalid login form error message', () => {
    const errorMessage = 'Please fill in the fields below.';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginError: { errorCode: 'invalid-form' },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#login-failure-alert p').first().text()).toEqual(errorMessage);
  });

  // ******** test redirection ********

  it('should redirect to url returned by login endpoint', () => {
    const dasboardUrl = 'http://localhost:18000/enterprise/select/active/?success_url=/dashboard';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: {
          success: true,
          redirectUrl: dasboardUrl,
        },
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL };
    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(dasboardUrl);
  });

  it('should redirect to finishAuthUrl upon successful login via SSO', () => {
    const authCompleteUrl = '/auth/complete/google-oauth2/';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: {
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

    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + authCompleteUrl);
  });

  it('should redirect to social auth provider url on SSO button click', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

    const loginUrl = '/auth/login/apple-id/?auth_entry=login&next=/dashboard';
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [{
            ...ssoProvider,
            loginUrl,
          }],
        },
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('button#oa2-apple-id').simulate('click');
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + loginUrl);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
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

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${ssoProvider.id}`).find('span').text()).toEqual(ssoProvider.name);
    expect(loginPage.find(`button#${ssoProvider.id}`).hasClass(`btn-tpa btn-${ssoProvider.id}`)).toEqual(true);
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
    window.location = { href: getConfig().BASE_URL.concat('/login'), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };
    secondaryProviders.iconImage = null;

    mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toEqual(getConfig().LMS_BASE_URL + secondaryProviders.loginUrl);
  });

  it('should render regular tpa button for invalid tpa_hint value', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: 'true',
    });

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

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${ssoProvider.id}`).find('span#provider-name').text()).toEqual(`${ssoProvider.name}`);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  // ******** miscellaneous tests ********

  it('should render cookie banner', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(<CookiePolicyBanner />)).toBeTruthy();
  });

  it('should send page event when login page is rendered', () => {
    mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(analytics.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'login');
  });

  it('tests that form is only scrollable on form submission', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#password').simulate('change', { target: { value: 'test', name: 'password' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.find(<IntlLoginFailureMessage />)).toBeTruthy();
    expect(loginPage.find('LoginPage').state('isSubmitted')).toEqual(true);
  });

  it('should set login survey cookie', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: {
          success: true,
        },
      },
    });

    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(document.cookie).toMatch(`${getConfig().USER_SURVEY_COOKIE_NAME}=login`);
  });

  it('should reset login form errors', () => {
    const errorState = { emailOrUsername: '', password: '' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');

    expect(store.dispatch).toHaveBeenCalledWith(loginRequestReset());
    expect(loginPage.state('errors')).toEqual(errorState);
  });
});
