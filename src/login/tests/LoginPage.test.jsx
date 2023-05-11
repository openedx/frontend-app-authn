import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { COMPLETE_STATE, LOGIN_PAGE, PENDING_STATE } from '../../data/constants';
import {
  loginRemovePasswordResetBanner, loginRequest, loginRequestFailure,
} from '../data/actions';
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

    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.change(screen.getByText(
      '',
      { selector: '#emailOrUsername' },
    ), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByText(
      '',
      { selector: '#password' },
    ), { target: { value: 'password' } });

    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(store.dispatch).toHaveBeenCalledWith(loginRequest({ email_or_username: 'test@example.com', password: 'password' }));
  });

  it('should not dispatch loginRequest on empty form submission', () => {
    store.dispatch = jest.fn(store.dispatch);
    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));
    expect(store.dispatch).not.toHaveBeenCalledWith(loginRequest({}));
  });

  // ******** test login form validations ********

  it('should match state on empty form submission', () => {
    store.dispatch = jest.fn(store.dispatch);

    render(reduxWrapper(<IntlLoginPage {...props} />));
    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(screen.getByText('Enter your username or email')).toBeDefined();
    expect(store.dispatch).toHaveBeenCalledWith(loginRequestFailure({ errorCode: 'invalid-form' }));
  });

  it('should match state for invalid email (less than 3 characters), on form submission', () => {
    store.dispatch = jest.fn(store.dispatch);

    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.change(screen.getByText(
      '',
      { selector: '#password' },
    ), { target: { value: 'test' } });
    fireEvent.change(screen.getByText(
      '',
      { selector: '#emailOrUsername' },
    ), { target: { value: 'te' } });

    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(screen.getByText('Username or email must have at least 3 characters.')).toBeDefined();
  });

  it('should reset field related error messages on onFocus event', async () => {
    store.dispatch = jest.fn(store.dispatch);

    render(reduxWrapper(<IntlLoginPage {...props} />));

    await act(async () => {
      // clicking submit button with empty fields to make the errors appear
      fireEvent.click(screen.getByText(
        '',
        { selector: '.btn-brand' },
      ));

      // focusing the fields to verify that the errors are cleared
      fireEvent.focus(screen.getByText(
        '',
        { selector: '#password' },
      ));
      fireEvent.focus(screen.getByText(
        '',
        { selector: '#emailOrUsername' },
      ));
    });

    // verifying that the errors are cleared
    await waitFor(() => {
      expect(screen.queryByText('Enter your username or email')).toBeNull();
    });
  });

  // ******** test form buttons and links ********

  it('should match default button state', () => {
    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText('Sign in')).toBeDefined();
  });

  it('should match pending button state', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        submitState: PENDING_STATE,
      },
    });

    render(reduxWrapper(<IntlLoginPage {...props} />));

    expect(screen.getByText(
      'pending',
    ).textContent).toEqual('pending');
  });

  it('should show forgot password link', () => {
    render(reduxWrapper(<IntlLoginPage {...props} />));

    expect(screen.getByText(
      'Forgot password',
      { selector: '#forgot-password' },
    ).textContent).toEqual('Forgot password');
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: `#${ssoProvider.id}` },
    )).toBeDefined();

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should not display institution login option when no secondary providers are present', () => {
    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Use my university info')).toBeNull();
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Or sign in with:')).toBeNull();
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeDefined();
    expect(queryByText('Institution/campus credentials')).toBeDefined();
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeNull();

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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeNull();
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeNull();
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeNull();
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeNull();

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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Institution/campus credentials')).toBeDefined();

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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeDefined();

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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toEqual(`We couldn't sign you in.${errorMessage}`);
  });

  it('should match account activation message', () => {
    const activationMessage = 'Success! You have activated your account.'
                              + 'You will now receive email updates and alerts from us related '
                              + 'to the courses you are enrolled in. Sign in to continue.';

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: '?account_activation_status=success' };

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toEqual(activationMessage);
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#tpa-alert' },
    ).textContent).toEqual(expectedMessage);
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toContain('An error occurred');
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toContain(errorMessage);
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
    render(reduxWrapper(<IntlLoginPage {...props} />));
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
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

    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.click(screen.getByText(
      '',
      { selector: '#oa2-apple-id' },
    ));
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: `#${ssoProvider.id}` },
    ).textContent).toEqual(ssoProvider.name);
    expect(screen.getByText(
      '',
      { selector: `.btn-${ssoProvider.id}` },
    )).toBeTruthy();
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
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

    const { container } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(container.querySelector(`#${ssoProvider.id}`).querySelector('#provider-name').textContent).toEqual(`${ssoProvider.name}`);

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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      'Show me other ways to sign in or register',
    ).textContent).toBeDefined();
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      'Show me other ways to sign in',
    ).textContent).toBeDefined();
  });

  // ******** miscellaneous tests ********

  it('should send page event when login page is rendered', () => {
    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'login');
  });

  it('tests that form is in invalid state when it is submission', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginError: { errorCode: 'invalid-form' },
      },
    });

    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.change(screen.getByText(
      '',
      { selector: '#password' },
    ), { target: { value: 'password', name: 'password' } });
    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(screen.getByText('Please fill in the fields below.')).toBeTruthy();
  });

  it('should reset login form errors', () => {
    store.dispatch = jest.fn(store.dispatch);

    render(reduxWrapper(<IntlLoginPage {...props} />));

    expect(store.dispatch).toHaveBeenCalledWith(loginRequestReset());
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
    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.change(screen.getByText(
      '',
      { selector: '#emailOrUsername' },
    ), { target: { value: '' } });
    fireEvent.change(screen.getByText(
      '',
      { selector: '#password' },
    ), { target: { value: '' } });
    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(store.dispatch).toHaveBeenCalledWith(setLoginFormData(formData));
  });

  it('should set form data in redux store on onBlur', () => {
    store.dispatch = jest.fn(store.dispatch);

    render(reduxWrapper(<IntlLoginPage {...props} />));
    fireEvent.blur(screen.getByText(
      '',
      { selector: '#emailOrUsername' },
    ));
    expect(store.dispatch).toHaveBeenCalledWith(setLoginFormData({ emailOrUsername: '' }));
  });

  it('should clear form field errors in redux store on onFocus', () => {
    store.dispatch = jest.fn(store.dispatch);

    render(reduxWrapper(<IntlLoginPage {...props} />));
    fireEvent.focus(screen.getByText(
      '',
      { selector: '#emailOrUsername' },
    ));

    expect(store.dispatch).toHaveBeenCalledWith(setLoginFormData({
      errors: {
        ...loginFormData.errors,
      },
    }));
  });

  it('should update form fields state if updated in redux store', async () => {
    const { rerender } = render(reduxWrapper(<IntlLoginPage {...props} />));

    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginFormData: {
          emailOrUsername: 'john_doe',
          password: 'password1',
        },
      },
    });

    rerender((
      <IntlProvider locale="en">
        <MemoryRouter>
          <Provider store={store}><IntlLoginPage {...props} /></Provider>
        </MemoryRouter>
      </IntlProvider>));

    expect(screen.getByDisplayValue('password1')).toBeDefined();
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
    const { unmount } = render(reduxWrapper(<IntlLoginPage {...props} />));
    unmount();

    expect(store.dispatch).toHaveBeenCalledWith(loginRemovePasswordResetBanner());
  });
});
