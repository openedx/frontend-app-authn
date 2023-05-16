import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import { COMPLETE_STATE, LOGIN_PAGE, PENDING_STATE } from '../../data/constants';
import { backupLoginFormBegin, dismissPasswordResetBanner, loginRequest } from '../data/actions';
import { INTERNAL_SERVER_ERROR } from '../data/constants';
import LoginPage from '../LoginPage';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthService: jest.fn(),
}));

const IntlLoginPage = injectIntl(LoginPage);
const mockStore = configureStore();

describe('LoginPage', () => {
  let props = {};
  let store = {};

  const emptyFieldValidation = { emailOrUsername: 'Enter your username or email', password: 'Enter your password' };
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
    iconClass: 'apple',
    iconImage: 'https://openedx.devstack.lms/logo.png',
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

    loginPage.find('input#emailOrUsername').simulate('change', { target: { value: 'test', name: 'emailOrUsername' } });
    loginPage.find('input#password').simulate('change', { target: { value: 'test-password', name: 'password' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(store.dispatch).toHaveBeenCalledWith(loginRequest({ email_or_username: 'test', password: 'test-password' }));
  });

  it('should not dispatch loginRequest on empty form submission', () => {
    store.dispatch = jest.fn(store.dispatch);
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('button.btn-brand').simulate('click');
    expect(store.dispatch).not.toHaveBeenCalledWith(loginRequest({}));
  });

  it('should dismiss reset password banner on form submission', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        showResetPasswordSuccessBanner: true,
      },
    });

    store.dispatch = jest.fn(store.dispatch);
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find('button.btn-brand').simulate('click');

    expect(store.dispatch).toHaveBeenCalledWith(dismissPasswordResetBanner());
  });

  // ******** test login form validations ********

  it('should show error messages for required fields on empty form submission', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.find('div[feedback-for="emailOrUsername"]').text()).toEqual(emptyFieldValidation.emailOrUsername);
    expect(loginPage.find('div[feedback-for="password"]').text()).toEqual(emptyFieldValidation.password);

    const alertBanner = 'We couldn\'t sign you in.Please fill in the fields below.';
    expect(loginPage.find('#login-failure-alert').first().text()).toEqual(alertBanner);
  });

  it('should run frontend validations for emailOrUsername field on form submission', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#emailOrUsername').simulate('change', { target: { value: 'te', name: 'emailOrUsername' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(
      loginPage.find('div[feedback-for="emailOrUsername"]',
      ).text()).toEqual('Username or email must have at least 3 characters.');
  });

  // ******** test field focus in functionality ********

  it('should clear field related error messages on input field Focus', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.find('div[feedback-for="emailOrUsername"]').text()).toEqual(emptyFieldValidation.emailOrUsername);
    loginPage.find('input#emailOrUsername').simulate('focus');
    expect(loginPage.find('div[feedback-for="emailOrUsername"]').exists()).toBeFalsy();

    expect(loginPage.find('div[feedback-for="password"]').text()).toEqual(emptyFieldValidation.password);
    loginPage.find('input#password').simulate('focus');
    expect(loginPage.find('div[feedback-for="password"]').exists()).toBeFalsy();
  });

  // ******** test form buttons and links ********

  it('should match default button state', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('button[type="submit"] span').first().text()).toEqual('Sign in');
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

    expect(button.find('.sr-only').text()).toEqual('pending');
  });

  it('should show forgot password link', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('a#forgot-password').text()).toEqual('Forgot password');
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

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${ssoProvider.id}`).length).toEqual(1);
  });

  it('should display sign-in header only when primary or secondary providers are available.', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(false);
    expect(loginPage.text().includes('Company or school credentials')).toBe(false);
    expect(loginPage.text().includes('Institution/campus credentials')).toBe(false);
  });

  it('should hide sign-in header and enterprise login upon successful SSO authentication', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [ssoProvider],
          secondaryProviders: [secondaryProviders],
          currentProvider: 'Apple',
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(false);
    expect(loginPage.text().includes('Company or school credentials')).toBe(false);
    expect(loginPage.text().includes('Institution/campus credentials')).toBe(false);
  });

  // ******** test enterprise login enabled scenarios ********

  it('should show sign-in header for enterprise login', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [ssoProvider],
          secondaryProviders: [secondaryProviders],
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(true);
    expect(loginPage.text().includes('Company or school credentials')).toBe(true);
  });

  // ******** test enterprise login disabled scenarios ********

  it('should show sign-in header for institution login if enterprise login is disabled', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: true,
    });

    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [ssoProvider],
          secondaryProviders: [secondaryProviders],
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(true);
    expect(loginPage.text().includes('Company or school credentials')).toBe(false);
    expect(loginPage.text().includes('Institution/campus credentials')).toBe(true);
  });

  it('should not show sign-in header without primary or secondary providers', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(false);
    expect(loginPage.text().includes('Company or school credentials')).toBe(false);
    expect(loginPage.text().includes('Institution/campus credentials')).toBe(false);
  });

  it('should show enterprise login if even if only secondary providers are available', () => {
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

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(true);
    expect(loginPage.text().includes('Institution/campus credentials')).toBe(true);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  // ******** test alert messages ********

  it('should match login internal server error message', () => {
    const expectedMessage = 'We couldn\'t sign you in.'
                            + 'An error has occurred. Try refreshing the page, or check your internet connection.';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginErrorCode: INTERNAL_SERVER_ERROR,
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('should match third party auth alert', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          currentProvider: 'Apple',
          platformName: 'openedX',
        },
      },
    });

    const expectedMessage = `${'You have successfully signed into Apple, but your Apple account does not have a '
                            + 'linked '}${ getConfig().SITE_NAME } account. To link your accounts, sign in now using your ${
                             getConfig().SITE_NAME } password.`;

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#tpa-alert p').text()).toEqual(expectedMessage);
  });

  it('should show third party authentication failure message', () => {
    const errorMessage = 'An error occurred during third party auth.';
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          currentProvider: null,
          errorMessage,
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#login-failure-alert p').text()).toContain(errorMessage);
  });

  it('should match invalid login form error message', () => {
    const errorMessage = 'Please fill in the fields below.';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginErrorCode: 'invalid-form',
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#login-failure-alert p').first().text()).toEqual(errorMessage);
  });

  // ******** test redirection ********

  it('should redirect to url returned by login endpoint after successful authentication', () => {
    const dashboardURL = 'https://test.com/testing-dashboard/';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: {
          success: true,
          redirectUrl: dashboardURL,
        },
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL };
    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(dashboardURL);
  });

  it('should redirect to social auth provider url on SSO button click', () => {
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

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('button#oa2-apple-id').simulate('click');
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + ssoProvider.loginUrl);
  });

  it('should redirect to finishAuthUrl upon successful authentication via SSO', () => {
    const finishAuthUrl = '/auth/complete/google-oauth2/';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: { success: true, redirectUrl: '' },
      },
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          finishAuthUrl,
        },
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + finishAuthUrl);
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
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };
    secondaryProviders.iconImage = null;

    mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toEqual(getConfig().LMS_BASE_URL + secondaryProviders.loginUrl);
  });

  it('should render regular tpa button for invalid tpa_hint value', () => {
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

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${ssoProvider.id}`).find('span#provider-name').text()).toEqual(`${ssoProvider.name}`);
  });

  it('should render "other ways to sign in" button on the tpa_hint page', () => {
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
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?tpa_hint=${ssoProvider.id}` };
    ssoProvider.iconImage = null;

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('button#other-ways-to-sign-in').text()).toEqual('Show me other ways to sign in or register');
  });

  it('should render other ways to sign in button when public account creation is disabled', () => {
    mergeConfig({
      ALLOW_PUBLIC_ACCOUNT_CREATION: false,
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
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?tpa_hint=${ssoProvider.id}` };
    ssoProvider.iconImage = null;

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('button#other-ways-to-sign-in').text()).toEqual('Show me other ways to sign in');
  });

  // ******** miscellaneous tests ********

  it('should send page event when login page is rendered', () => {
    mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'login');
  });

  it('should backup the login form state when shouldBackupState is true', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        shouldBackupState: true,
      },
    });

    store.dispatch = jest.fn(store.dispatch);
    mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(store.dispatch).toHaveBeenCalledWith(backupLoginFormBegin(
      {
        formFields: {
          emailOrUsername: '', password: '',
        },
        errors: {
          emailOrUsername: '', password: '',
        },
      },
    ));
  });

  it('should update form fields state if updated in redux store', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginFormData: {
          formFields: {
            emailOrUsername: 'john_doe', password: 'test-password',
          },
          errors: {
            emailOrUsername: '', password: '',
          },
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />)).find('LoginPage');
    expect(loginPage.find('input#emailOrUsername').props().value).toEqual('john_doe');
    expect(loginPage.find('input#password').props().value).toEqual('test-password');
  });
});
