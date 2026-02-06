import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { COMPLETE_STATE, LOGIN_PAGE, PENDING_STATE } from '../../data/constants';
import { INTERNAL_SERVER_ERROR } from '../data/constants';
import LoginPage from '../LoginPage';
import { useLogin } from '../data/apiHook';
import { useThirdPartyAuthContext as useThirdPartyAuthHook } from '../../common-components/data/apiHook';
import { useThirdPartyAuthContext } from '../../common-components/components/ThirdPartyAuthContext';
import { RegisterProvider } from '../../register/components/RegisterContext';

// Mock React Query hooks
jest.mock('../data/apiHook');
jest.mock('../../common-components/data/apiHook');
jest.mock('../../common-components/components/ThirdPartyAuthContext');

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthService: jest.fn(),
}));

describe('LoginPage', () => {
  let props = {};
  let mockLoginMutate;
  let mockThirdPartyAuthMutate;
  let mockThirdPartyAuthContext;
  let queryClient;

  const emptyFieldValidation = { emailOrUsername: 'Enter your username or email', password: 'Enter your password' };
  
  const queryWrapper = children => (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <MemoryRouter>
          <RegisterProvider>
            {children}
          </RegisterProvider>
        </MemoryRouter>
      </IntlProvider>
    </QueryClientProvider>
  );

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
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock the login hook
    mockLoginMutate = jest.fn();
    useLogin.mockReturnValue({
      mutate: mockLoginMutate,
      isPending: false,
    });

    // Mock the third party auth hook
    mockThirdPartyAuthMutate = jest.fn();
    useThirdPartyAuthHook.mockReturnValue({
      mutate: mockThirdPartyAuthMutate,
      isPending: false,
    });

    // Mock the third party auth context
    mockThirdPartyAuthContext = {
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        currentProvider: null,
        finishAuthUrl: null,
        providers: [],
        secondaryProviders: [],
        platformName: '',
        errorMessage: '',
      },
      setThirdPartyAuthContextBegin: jest.fn(),
      setThirdPartyAuthContextSuccess: jest.fn(),
      setThirdPartyAuthContextFailure: jest.fn(),
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    props = {
      institutionLogin: false,
      handleInstitutionLogin: jest.fn(),
      // Legacy props for backward compatibility
      loginRequest: jest.fn(),
    };
  });

  // ******** test login form submission ********

  it('should submit form for valid input', () => {
    render(queryWrapper(<LoginPage {...props} />));

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

    expect(props.loginRequest).toHaveBeenCalledWith({ email_or_username: 'test', password: 'test-password' });
  });

  it('should not dispatch loginRequest on empty form submission', () => {
    render(queryWrapper(<LoginPage {...props} />));

    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));
    expect(props.loginRequest).not.toHaveBeenCalled();
  });

  it('should dismiss reset password banner on form submission', () => {
    props.showResetPasswordSuccessBanner = true;
    props.dismissPasswordResetBanner = jest.fn();
    
    render(queryWrapper(<LoginPage {...props} />));
    fireEvent.click(screen.getByText(
      '',
      { selector: '.btn-brand' },
    ));

    expect(props.dismissPasswordResetBanner).toHaveBeenCalled();
  });

  // ******** test login form validations ********

  it('should match state for invalid email (less than 2 characters), on form submission', () => {
    render(queryWrapper(<LoginPage {...props} />));

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
    const { container } = render(queryWrapper(<LoginPage {...props} />));
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
    const { container } = render(queryWrapper(<LoginPage {...props} />));

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
    render(queryWrapper(<LoginPage {...props} />));

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
    render(queryWrapper(<LoginPage {...props} />));
    expect(screen.getByText('Sign in')).toBeDefined();
  });

  it('should match pending button state', () => {
    useLogin.mockReturnValue({
      mutate: mockLoginMutate,
      isPending: true,
    });

    render(queryWrapper(<LoginPage {...props} />));

    expect(screen.getByText(
      'pending',
    ).textContent).toEqual('pending');
  });

  it('should show forgot password link', () => {
    render(queryWrapper(<LoginPage {...props} />));

    expect(screen.getByText(
      'Forgot password',
      { selector: '#forgot-password' },
    ).textContent).toEqual('Forgot password');
  });

  it('should show single sign on provider button', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext.providers = [ssoProvider];
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    render(queryWrapper(<LoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: `#${ssoProvider.id}` },
    )).toBeDefined();

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should display sign-in header only when primary or secondary providers are available.', () => {
    // Reset mocks to empty providers
    mockThirdPartyAuthContext.thirdPartyAuthContext.providers = [];
    mockThirdPartyAuthContext.thirdPartyAuthContext.secondaryProviders = [];
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    const { queryByText } = render(queryWrapper(<LoginPage {...props} />));
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Or sign in with:')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeNull();
  });

  it('should hide sign-in header and enterprise login upon successful SSO authentication', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
      secondaryProviders: [secondaryProviders],
      currentProvider: 'Apple',
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    const { queryByText } = render(queryWrapper(<LoginPage {...props} />));
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Or sign in with:')).toBeNull();
  });

  // ******** test enterprise login enabled scenarios ********

  it('should show sign-in header for enterprise login', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
      secondaryProviders: [secondaryProviders],
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    const { queryByText } = render(queryWrapper(<LoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeDefined();
    expect(queryByText('Institution/campus credentials')).toBeDefined();
  });

  // ******** test enterprise login disabled scenarios ********

  it('should show sign-in header for institution login if enterprise login is disabled', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: true,
    });

    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
      secondaryProviders: [secondaryProviders],
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    const { queryByText } = render(queryWrapper(<LoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeDefined();

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should show sign-in header with secondary Providers and without Providers', () => {
    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: true,
    });

    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      secondaryProviders: [{
        ...secondaryProviders,
      }],
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    const { queryByText } = render(queryWrapper(<LoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Institution/campus credentials')).toBeDefined();

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should not show sign-in header without primary or secondary providers', () => {
    // Already mocked with empty providers in beforeEach
    const { queryByText } = render(queryWrapper(<LoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeNull();
    expect(queryByText('Company or school credentials')).toBeNull();
  });

  it('should show enterprise login if even if only secondary providers are available', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      secondaryProviders: [secondaryProviders],
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    const { queryByText } = render(queryWrapper(<LoginPage {...props} />));
    expect(queryByText('Or sign in with:')).toBeDefined();
    expect(queryByText('Company or school credentials')).toBeNull();
    expect(queryByText('Institution/campus credentials')).toBeDefined();

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  // ******** test alert messages ********

  it('should match login internal server error message', () => {
    const expectedMessage = 'We couldn\'t sign you in.'
                            + 'An error has occurred. Try refreshing the page, or check your internet connection.';
    props.loginErrorCode = INTERNAL_SERVER_ERROR;

    render(queryWrapper(<LoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toEqual(`${expectedMessage}`);
  });

  it('should match third party auth alert', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      currentProvider: 'Apple',
      platformName: 'openedX',
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    const expectedMessage = `${'You have successfully signed into Apple, but your Apple account does not have a '
                            + 'linked '}${ getConfig().SITE_NAME } account. To link your accounts, sign in now using your ${
                             getConfig().SITE_NAME } password.`;

    render(queryWrapper(<LoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#tpa-alert' },
    ).textContent).toEqual(expectedMessage);
  });

  it('should show third party authentication failure message', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      currentProvider: null,
      errorMessage: 'An error occurred',
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);
    
    render(queryWrapper(<LoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toContain('An error occurred');
  });

  it('should match invalid login form error message', () => {
    const errorMessage = 'Please fill in the fields below.';
    props.loginErrorCode = 'invalid-form';

    render(queryWrapper(<LoginPage {...props} />));
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toContain(errorMessage);
  });

  // ******** test redirection ********

  it('should redirect to url returned by login endpoint after successful authentication', () => {
    const dashboardURL = 'https://test.com/testing-dashboard/';
    props.loginResult = {
      success: true,
      redirectUrl: dashboardURL,
    };

    delete window.location;
    window.location = { href: getConfig().BASE_URL };
    render(queryWrapper(<LoginPage {...props} />));
    expect(window.location.href).toBe(dashboardURL);
  });

  it('should redirect to finishAuthUrl upon successful login via SSO', () => {
    const authCompleteUrl = '/auth/complete/google-oauth2/';
    props.loginResult = {
      success: true,
      redirectUrl: '',
    };
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      finishAuthUrl: authCompleteUrl,
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    render(queryWrapper(<LoginPage {...props} />));
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + authCompleteUrl);
  });

  it('should redirect to social auth provider url on SSO button click', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    render(queryWrapper(<LoginPage {...props} />));

    fireEvent.click(screen.getByText(
      '',
      { selector: '#oa2-apple-id' },
    ));
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + ssoProvider.loginUrl);
  });

  it('should redirect to finishAuthUrl upon successful authentication via SSO', () => {
    const finishAuthUrl = '/auth/complete/google-oauth2/';
    props.loginResult = {
      success: true, 
      redirectUrl: '',
    };
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      finishAuthUrl,
    };
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    render(queryWrapper(<LoginPage {...props} />));
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + finishAuthUrl);
  });

  // ******** test hinted third party auth ********

  it('should render tpa button for tpa_hint id matching one of the primary providers', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
    };
    mockThirdPartyAuthContext.thirdPartyAuthApiStatus = COMPLETE_STATE;
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };

    render(queryWrapper(<LoginPage {...props} />));
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
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
    };
    mockThirdPartyAuthContext.thirdPartyAuthApiStatus = PENDING_STATE;
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };

    const { container } = render(queryWrapper(<LoginPage {...props} />));
    expect(container.querySelector('.react-loading-skeleton')).toBeTruthy();
  });

  it('should render tpa button for tpa_hint id matching one of the secondary providers', () => {
    secondaryProviders.skipHintedLogin = true;
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      secondaryProviders: [secondaryProviders],
    };
    mockThirdPartyAuthContext.thirdPartyAuthApiStatus = COMPLETE_STATE;
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };
    secondaryProviders.iconImage = null;

    render(queryWrapper(<LoginPage {...props} />));
    expect(window.location.href).toEqual(getConfig().LMS_BASE_URL + secondaryProviders.loginUrl);
  });

  it('should render regular tpa button for invalid tpa_hint value', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
    };
    mockThirdPartyAuthContext.thirdPartyAuthApiStatus = COMPLETE_STATE;
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: '?next=/dashboard&tpa_hint=invalid' };

    const { container } = render(queryWrapper(<LoginPage {...props} />));
    expect(container.querySelector(`#${ssoProvider.id}`).querySelector('#provider-name').textContent).toEqual(`${ssoProvider.name}`);

    mergeConfig({
      DISABLE_ENTERPRISE_LOGIN: '',
    });
  });

  it('should render "other ways to sign in" button on the tpa_hint page', () => {
    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
    };
    mockThirdPartyAuthContext.thirdPartyAuthApiStatus = COMPLETE_STATE;
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?tpa_hint=${ssoProvider.id}` };

    render(queryWrapper(<LoginPage {...props} />));
    expect(screen.getByText(
      'Show me other ways to sign in or register',
    ).textContent).toBeDefined();
  });

  it('should render other ways to sign in button when public account creation is disabled', () => {
    mergeConfig({
      ALLOW_PUBLIC_ACCOUNT_CREATION: false,
    });

    mockThirdPartyAuthContext.thirdPartyAuthContext = {
      ...mockThirdPartyAuthContext.thirdPartyAuthContext,
      providers: [ssoProvider],
    };
    mockThirdPartyAuthContext.thirdPartyAuthApiStatus = COMPLETE_STATE;
    useThirdPartyAuthContext.mockReturnValue(mockThirdPartyAuthContext);

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?tpa_hint=${ssoProvider.id}` };

    render(queryWrapper(<LoginPage {...props} />));
    expect(screen.getByText(
      'Show me other ways to sign in',
    ).textContent).toBeDefined();
  });

  // ******** miscellaneous tests ********

  it('should send page event when login page is rendered', () => {
    render(queryWrapper(<LoginPage {...props} />));
    expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'login');
  });

  it('tests that form is in invalid state when it is submitted', () => {
    props.shouldBackupState = true;
    props.backupLoginFormBegin = jest.fn();

    render(queryWrapper(<LoginPage {...props} />));
    expect(props.backupLoginFormBegin).toHaveBeenCalledWith(
      {
        formFields: {
          emailOrUsername: '', password: '',
        },
        errors: {
          emailOrUsername: '', password: '',
        },
      },
    );
  });

  it('should send track event when forgot password link is clicked', () => {
    render(queryWrapper(<LoginPage {...props} />));
    fireEvent.click(screen.getByText(
      'Forgot password',
      { selector: '#forgot-password' },
    ));

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.password-reset_form.toggled', { category: 'user-engagement' });
  });

  it('should backup the login form state when shouldBackupState is true', () => {
    props.shouldBackupState = true;
    props.backupLoginFormBegin = jest.fn();

    render(queryWrapper(<LoginPage {...props} />));
    expect(props.backupLoginFormBegin).toHaveBeenCalledWith(
      {
        formFields: {
          emailOrUsername: '', password: '',
        },
        errors: {
          emailOrUsername: '', password: '',
        },
      },
    );
  });

  it('should update form fields state if updated in redux store', () => {
    props.loginFormData = {
      formFields: {
        emailOrUsername: 'john_doe', password: 'test-password',
      },
      errors: {
        emailOrUsername: '', password: '',
      },
    };

    const { container } = render(queryWrapper(<LoginPage {...props} />));
    expect(container.querySelector('input#emailOrUsername').value).toEqual('john_doe');
    expect(container.querySelector('input#password').value).toEqual('test-password');
  });
});
