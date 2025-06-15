import { Provider } from 'react-redux';

import {
  getSiteConfig, injectIntl, CurrentAppProvider, IntlProvider, mergeAppConfig
} from '@openedx/frontend-base';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { initializeMockServices, testAppId } from '../../setupTest';
import { COMPLETE_STATE, LOGIN_PAGE, PENDING_STATE } from '../../data/constants';
import { backupLoginFormBegin, dismissPasswordResetBanner, loginRequest } from '../data/actions';
import { INTERNAL_SERVER_ERROR } from '../data/constants';
import LoginPage from '../LoginPage';


const { analyticsService } = initializeMockServices();
const IntlLoginPage = injectIntl(LoginPage);
const mockStore = configureStore();


describe('LoginPage', () => {
  let props = {};
  let store = {};

  const emptyFieldValidation = { emailOrUsername: 'Enter your username or email', password: 'Enter your password' };
  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <CurrentAppProvider appId={testAppId}>
          <Provider store={store}>{children}</Provider>
        </CurrentAppProvider>
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
  });

  // ******** test login form submission ********

  it('should submit form for valid input', () => {
    store.dispatch = jest.fn(store.dispatch);

    mergeAppConfig(testAppId, {
      DISABLE_ENTERPRISE_LOGIN: '',
    });

    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.change(screen.getByText(
      '',
      { selector: '#emailOrUsername' },
    ), { target: { value: 'test', name: 'emailOrUsername' } });
    fireEvent.change(screen.getByText(
      '',
      { selector: '#password' },
    ), { target: { value: 'test-password', name: 'password' } });

    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(store.dispatch).toHaveBeenCalledWith(loginRequest({ email_or_username: 'test', password: 'test-password' }));
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

  it('should dismiss reset password banner on form submission', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        showResetPasswordSuccessBanner: true,
      },
    });

    store.dispatch = jest.fn(store.dispatch);
    render(reduxWrapper(<IntlLoginPage {...props} />));
    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(store.dispatch).toHaveBeenCalledWith(dismissPasswordResetBanner());
  });

  // ******** test login form validations ********

  it('should match state for invalid email (less than 2 characters), on form submission', () => {
    store.dispatch = jest.fn(store.dispatch);

    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.change(screen.getByText(
      '',
      { selector: '#password' },
    ), { target: { value: 'test' } });
    fireEvent.change(screen.getByText(
      '',
      { selector: '#emailOrUsername' },
    ), { target: { value: 't' } });

    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(screen.getByText('Username or email must have at least 2 characters.')).toBeDefined();
  });

  it('should show error messages for required fields on empty form submission', () => {
    const { container } = render(reduxWrapper(<IntlLoginPage {...props} />));
    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(container.querySelector('div[feedback-for="emailOrUsername"]').textContent).toEqual(emptyFieldValidation.emailOrUsername);
    expect(container.querySelector('div[feedback-for="password"]').textContent).toEqual(emptyFieldValidation.password);

    const alertBanner = 'We couldn\'t sign you in.Please fill in the fields below.';
    expect(container.querySelector('#login-failure-alert').textContent).toEqual(alertBanner);
  });

  it('should run frontend validations for emailOrUsername field on form submission', () => {
    const { container } = render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.change(screen.getByText(
      '',
      { selector: '#emailOrUsername' },
    ), { target: { value: 't', name: 'emailOrUsername' } });

    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(container.querySelector('div[feedback-for="emailOrUsername"]').textContent).toEqual('Username or email must have at least 2 characters.');
  });

  // ******** test field focus in functionality ********
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: `#${ssoProvider.id}` },
    )).toBeDefined();

    mergeAppConfig(testAppId, {
      DISABLE_ENTERPRISE_LOGIN: '',
    });
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Or sign in with:')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeNull();
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Or sign in with:')).toBeNull();
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeDefined();
    expect(queryByText('Institution/campus credentials')).toBeDefined();
  });

  // ******** test enterprise login disabled scenarios ********

  it('should show sign-in header for institution login if enterprise login is disabled', () => {
    mergeAppConfig(testAppId, {
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeDefined();

    mergeAppConfig(testAppId, {
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should show sign-in header with secondary Providers and without Providers', () => {
    mergeAppConfig(testAppId, {
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

    mergeAppConfig(testAppId, {
      DISABLE_ENTERPRISE_LOGIN: '',
    });
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeNull();
    expect(queryByText('Company or school credentials')).toBeNull();
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

    const { queryByText } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeDefined();

    mergeAppConfig(testAppId, {
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

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toEqual(`${expectedMessage}`);
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
      + 'linked '}${getSiteConfig().siteName} account. To link your accounts, sign in now using your ${getSiteConfig().siteName} password.`;

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#tpa-alert' },
    ).textContent).toEqual(expectedMessage);
  });

  it('should show third party authentication failure message', () => {
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
        loginErrorCode: 'invalid-form',
      },
    });

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toContain(errorMessage);
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
    window.location = { href: getSiteConfig().baseUrl };
    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(dashboardURL);
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
    window.location = { href: getSiteConfig().baseUrl };

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(getSiteConfig().lmsBaseUrl + authCompleteUrl);
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
    window.location = { href: getSiteConfig().baseUrl };

    render(reduxWrapper(<IntlLoginPage {...props} />));

    fireEvent.click(screen.getByText(
      '',
      { selector: '#oa2-apple-id' },
    ));
    expect(window.location.href).toBe(getSiteConfig().lmsBaseUrl + ssoProvider.loginUrl);
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
    window.location = { href: getSiteConfig().baseUrl };

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(getSiteConfig().lmsBaseUrl + finishAuthUrl);
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
    window.location = { href: getSiteConfig().baseUrl.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };

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

  it('should render the skeleton when third party status is pending', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [ssoProvider],
        },
        thirdPartyAuthApiStatus: PENDING_STATE,
      },
    });

    delete window.location;
    window.location = { href: getSiteConfig().baseUrl.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };

    const { container } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(container.querySelector('.react-loading-skeleton')).toBeTruthy();
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
    window.location = { href: getSiteConfig().baseUrl.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };
    secondaryProviders.iconImage = null;

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toEqual(getSiteConfig().lmsBaseUrl + secondaryProviders.loginUrl);
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
    window.location = { href: getSiteConfig().baseUrl.concat(LOGIN_PAGE), search: '?next=/dashboard&tpa_hint=invalid' };

    const { container } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(container.querySelector(`#${ssoProvider.id}`).querySelector('#provider-name').textContent).toEqual(`${ssoProvider.name}`);

    mergeAppConfig(testAppId, {
      DISABLE_ENTERPRISE_LOGIN: '',
    });
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

    mergeAppConfig(testAppId, {
      ALLOW_PUBLIC_ACCOUNT_CREATION: true,
      SHOW_REGISTRATION_LINKS: true,
    });

    delete window.location;
    window.location = { href: getSiteConfig().baseUrl.concat(LOGIN_PAGE), search: `?tpa_hint=${ssoProvider.id}` };

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      'Show me other ways to sign in or register',
    ).textContent).toBeDefined();
  });

  it('should render other ways to sign in button when public account creation is disabled', () => {
    mergeAppConfig(testAppId, {
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
    window.location = { href: getSiteConfig().baseUrl.concat(LOGIN_PAGE), search: `?tpa_hint=${ssoProvider.id}` };

    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(screen.getByText(
      'Show me other ways to sign in',
    ).textContent).toBeDefined();
  });

  // ******** miscellaneous tests ********

  it('should send page event when login page is rendered', () => {
    render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(analyticsService.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'login', undefined);
  });

  it('tests that form is in invalid state when it is submitted', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        shouldBackupState: true,
      },
    });

    store.dispatch = jest.fn(store.dispatch);
    render(reduxWrapper(<IntlLoginPage {...props} />));
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

  it('should send track event when forgot password link is clicked', () => {
    render(reduxWrapper(<IntlLoginPage {...props} />));
    fireEvent.click(screen.getByText(
      'Forgot password',
      { selector: '#forgot-password' },
    ));

    expect(analyticsService.sendTrackEvent).toHaveBeenCalledWith('edx.bi.password-reset_form.toggled', { category: 'user-engagement' });
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
    render(reduxWrapper(<IntlLoginPage {...props} />));
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

    const { container } = render(reduxWrapper(<IntlLoginPage {...props} />));
    expect(container.querySelector('input#emailOrUsername').value).toEqual('john_doe');
    expect(container.querySelector('input#password').value).toEqual('test-password');
  });
});
