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
import {
  loginRemovePasswordResetBanner, loginRequest, loginRequestFailure, loginRequestReset, setLoginFormData,
} from '../data/actions';
import { INTERNAL_SERVER_ERROR } from '../data/constants';
import LoginFailureMessage from '../LoginFailure';
import LoginPage from '../LoginPage';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthService: jest.fn(),
}));

const IntlLoginFailureMessage = injectIntl(LoginFailureMessage);
const IntlLoginPage = injectIntl(LoginPage);
const mockStore = configureStore();

describe('LoginPage', () => {
  let props = {};
  let store = {};
  let loginFormData = {};

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
    register: {
      validationApiRateLimited: false,
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
    loginFormData = {
      emailOrUsername: '',
      password: '',
      errors: {
        emailOrUsername: '',
        password: '',
      },
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

  it('should match state for invalid email (less than 2 characters), on form submission', () => {
    const errorState = { emailOrUsername: 'Username or email must have at least 2 characters.', password: '' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');

    loginPage.find('input#password').simulate('change', { target: { value: 'test', name: 'password' } });
    loginPage.find('input#emailOrUsername').simulate('change', { target: { value: 't', name: 'email' } });
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
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });

    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [{
            ...ssoProvider,
          }],
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

  it('should not show sign-in header and enterprise login once user authenticated through SSO', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });

    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [{
            ...ssoProvider,
          }],
          currentProvider: 'Apple',
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Company or school credentials')).toBe(false);
    expect(loginPage.text().includes('Or sign in with:')).toBe(false);
  });

  it('should show sign-in header providers (ENABLE ENTERPRISE LOGIN)', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });

    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [{
            ...ssoProvider,
          }],
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(true);
    expect(loginPage.text().includes('Company or school credentials')).toBe(true);
    expect(loginPage.text().includes('Institution/campus credentials')).toBe(false);
  });

  it('should show sign-in header with providers (DISABLE ENTERPRISE LOGIN)', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: true,
    });

    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [{
            ...ssoProvider,
          }],
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(true);
    expect(loginPage.text().includes('Company or school credentials')).toBe(false);
    expect(loginPage.text().includes('Institution/campus credentials')).toBe(false);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should not show sign-in header without Providers and secondary Providers (ENABLE ENTERPRISE LOGIN)', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });

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

  it('should not show sign-in header without Providers and secondary Providers (DISABLE ENTERPRISE LOGIN)', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: true,
    });

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

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should show sign-in header with secondary Providers and without Providers', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: true,
    });

    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          secondaryProviders: [{
            ...secondaryProviders,
          }],
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

  it('should show sign-in header with Providers and secondary Providers', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: true,
    });

    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [{
            ...ssoProvider,
          }],
          secondaryProviders: [{
            ...secondaryProviders,
          }],
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.text().includes('Or sign in with:')).toBe(true);
    expect(loginPage.text().includes('Company or school credentials')).toBe(false);
    expect(loginPage.text().includes('Institution/campus credentials')).toBe(true);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  // ******** test alert messages ********

  it('should match login error message', () => {
    const errorMessage = 'An error has occurred. Try refreshing the page, or check your internet connection.';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginError: { errorCode: INTERNAL_SERVER_ERROR },
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
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: '?account_activation_status=success' };

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
          platformName: 'openedX',
        },
      },
    });

    const expectedMessage = `${'You have successfully signed into Apple, but your Apple account does not have a '
                            + 'linked '}${ getConfig().SITE_NAME } account. To link your accounts, sign in now using your ${
                             getConfig().SITE_NAME } password.`;

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#tpa-alert').find('p').text()).toEqual(expectedMessage);
  });

  it('should show tpa authentication fails error message', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          currentProvider: null,
          errorMessage: 'An error occurred',
        },
      },
    });

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#login-failure-alert').find('p').text()).toContain('An error occurred');
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
    const dashboardUrl = 'http://localhost:18000/enterprise/select/active/?success_url=/dashboard';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: {
          success: true,
          redirectUrl: dashboardUrl,
        },
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL };
    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(dashboardUrl);
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
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };

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
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: '?next=/dashboard&tpa_hint=invalid' };

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${ssoProvider.id}`).find('span#provider-name').text()).toEqual(`${ssoProvider.name}`);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should render other ways to sign in button', () => {
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

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('button#other-ways-to-sign-in').text()).toEqual('Show me other ways to sign in or register');
  });

  it('should render other ways to sign in button when public account creation disabled', () => {
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

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('button#other-ways-to-sign-in').text()).toEqual('Show me other ways to sign in');
  });

  // ******** miscellaneous tests ********

  it('should send page event when login page is rendered', () => {
    mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'login');
  });

  it('tests that form is only scrollable on form submission', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#password').simulate('change', { target: { value: 'test', name: 'password' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.find(<IntlLoginFailureMessage />)).toBeTruthy();
    expect(loginPage.find('LoginPage').state('isSubmitted')).toEqual(true);
  });

  it('should reset login form errors', () => {
    const errorState = { emailOrUsername: '', password: '' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');

    expect(store.dispatch).toHaveBeenCalledWith(loginRequestReset());
    expect(loginPage.state('errors')).toEqual(errorState);
  });

  // persists form data tests

  it('should set errors in redux store on submit form for invalid input', () => {
    const formData = {
      errors: {
        emailOrUsername: 'Enter your username or email',
        password: 'Enter your password',
      },
    };
    store.dispatch = jest.fn(store.dispatch);
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#emailOrUsername').simulate('change', { target: { value: '' } });
    loginPage.find('input#password').simulate('change', { target: { value: '' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(store.dispatch).toHaveBeenCalledWith(setLoginFormData(formData));
  });

  it('should set form data in redux store on onBlur', () => {
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find('input#emailOrUsername').simulate('blur');

    expect(store.dispatch).toHaveBeenCalledWith(setLoginFormData({ emailOrUsername: '' }));
  });

  it('should clear form field errors in redux store on onFocus', () => {
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find('input#emailOrUsername').simulate('focus');

    expect(store.dispatch).toHaveBeenCalledWith(setLoginFormData({
      errors: {
        ...loginFormData.errors,
      },
    }));
  });

  it('should update form fields state if updated in redux store', () => {
    const nextProps = {
      loginFormData: {
        emailOrUsername: 'john_doe',
        password: 'password1',
      },
    };

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find('LoginPage').instance().shouldComponentUpdate(nextProps);

    expect(loginPage.find('LoginPage').state('emailOrUsername')).toEqual('john_doe');
    expect(loginPage.find('LoginPage').state('password')).toEqual('password1');
  });

  it('should update reset password value when unmount called', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        resetPassword: true,
      },
    });

    store.dispatch = jest.fn(store.dispatch);
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.unmount();

    expect(store.dispatch).toHaveBeenCalledWith(loginRemovePasswordResetBanner());
  });
});
