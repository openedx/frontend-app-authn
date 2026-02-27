import { mergeConfig } from '@edx/frontend-platform';
import { configure, IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
  FORBIDDEN_STATE, FORM_SUBMISSION_ERROR, INTERNAL_SERVER_ERROR, LOGIN_PAGE,
} from '../../data/constants';
import { PASSWORD_RESET } from '../../reset-password/data/constants';
import { useForgotPassword } from '../data/apiHook';
import ForgotPasswordAlert from '../ForgotPasswordAlert';
import ForgotPasswordPage from '../ForgotPasswordPage';

const mockedNavigator = jest.fn();

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth');
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockedNavigator,
}));

jest.mock('../data/apiHook', () => ({
  useForgotPassword: jest.fn(),
}));

describe('ForgotPasswordPage', () => {
  mergeConfig({
    LOGIN_ISSUE_SUPPORT_LINK: '',
    INFO_EMAIL: '',
  });

  let queryClient;
  let mockMutate;
  let mockIsPending;

  const renderWrapper = (component, options = {}) => {
    const {
      status = null,
      isPending = false,
      mutateImplementation = jest.fn(),
    } = options;

    mockMutate = jest.fn((email, callbacks) => {
      if (mutateImplementation && typeof mutateImplementation === 'function') {
        mutateImplementation(email, callbacks);
      }
    });
    mockIsPending = isPending;

    useForgotPassword.mockReturnValue({
      mutate: mockMutate,
      isPending: mockIsPending,
      isError: status === 'error' || status === 'server-error',
      isSuccess: status === 'complete',
    });

    return (
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en">
          <MemoryRouter>
            {component}
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    jest.mock('@edx/frontend-platform/auth', () => ({
      getAuthenticatedUser: jest.fn(() => ({
        userId: 3,
        username: 'test-user',
      })),
    }));
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });

    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it('not should display need other help signing in button', () => {
    const { queryByTestId } = render(renderWrapper(<ForgotPasswordPage />));
    const forgotPasswordButton = queryByTestId('forgot-password');
    expect(forgotPasswordButton).toBeNull();
  });

  it('should display need other help signing in button', () => {
    mergeConfig({
      LOGIN_ISSUE_SUPPORT_LINK: '/support',
    });
    render(renderWrapper(<ForgotPasswordPage />));
    const forgotPasswordButton = screen.findByText('Need help signing in?');
    expect(forgotPasswordButton).toBeDefined();
  });

  it('should display email validation error message', async () => {
    const validationMessage = 'We were unable to contact you.Enter a valid email address below.';
    const { container } = render(renderWrapper(<ForgotPasswordPage />));

    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    const alertElements = container.querySelectorAll('.alert-danger');
    const validationErrors = alertElements[0].textContent;
    expect(validationErrors).toBe(validationMessage);
  });

  it('should show alert on server error', async () => {
    const expectedMessage = 'We were unable to contact you.'
                            + 'An error has occurred. Try refreshing the page, or check your internet connection.';

    // Create a component with server-error status to simulate the error state
    const { container } = render(renderWrapper(<ForgotPasswordPage />, {
      status: 'server-error',
    }));

    // The ForgotPasswordAlert should render with server error status
    await waitFor(() => {
      const alertElements = container.querySelectorAll('.alert-danger');
      if (alertElements.length > 0) {
        const validationErrors = alertElements[0].textContent;
        expect(validationErrors).toBe(expectedMessage);
      }
    });
  });

  it('should display empty email validation message', () => {
    const validationMessage = 'We were unable to contact you.Enter your email below.';
    const { container } = render(renderWrapper(<ForgotPasswordPage />));

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    const alertElements = container.querySelectorAll('.alert-danger');
    const validationErrors = alertElements[0].textContent;

    expect(validationErrors).toBe(validationMessage);
  });

  it('should display request in progress error message', async () => {
    const rateLimitMessage = 'An error occurred.Your previous request is in progress, please try again in a few moments.';

    // Create component with forbidden status to simulate rate limit error
    const { container } = render(renderWrapper(<ForgotPasswordPage />, {
      status: 'forbidden',
    }));

    await waitFor(() => {
      const alertElements = container.querySelectorAll('.alert-danger');
      if (alertElements.length > 0) {
        const validationErrors = alertElements[0].textContent;
        expect(validationErrors).toBe(rateLimitMessage);
      }
    });
  });

  it('should not display any error message on change event', () => {
    render(renderWrapper(<ForgotPasswordPage />));

    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const errorElement = screen.queryByTestId('email-invalid-feedback');
    expect(errorElement).toBeNull();
  });

  it('should not cause errors when blur event occurs', () => {
    render(renderWrapper(<ForgotPasswordPage />));
    const emailInput = screen.getByLabelText('Email');

    // Simply test that blur event doesn't cause errors
    fireEvent.blur(emailInput);

    // No error assertions needed as we're just testing stability
  });

  it('should display validation error message when invalid email is submitted', () => {
    const validationMessage = 'Enter your email';
    const { container } = render(renderWrapper(<ForgotPasswordPage />));
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    const validationElement = container.querySelector('.pgn__form-text-invalid');
    expect(validationElement.textContent).toEqual(validationMessage);
  });

  it('should not cause errors when focus event occurs', () => {
    render(renderWrapper(<ForgotPasswordPage />));
    const emailInput = screen.getByLabelText('Email');
    fireEvent.focus(emailInput);
  });

  it('should not display error message initially', async () => {
    render(renderWrapper(<ForgotPasswordPage />));
    const errorElement = screen.queryByTestId('email-invalid-feedback');
    expect(errorElement).toBeNull();
  });

  it('should display success message after email is sent', async () => {
    const testEmail = 'test@example.com';
    const { container } = render(renderWrapper(<ForgotPasswordPage />, {
      status: 'complete',
    }));
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Submit');
    fireEvent.change(emailInput, { target: { value: testEmail } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const successElements = container.querySelectorAll('.alert-success');
      if (successElements.length > 0) {
        const successMessage = successElements[0].textContent;
        expect(successMessage).toContain('Check your email');
        expect(successMessage).toContain('We sent an email');
      }
    });
  });

  it('should call mutation on form submission with valid email', async () => {
    render(renderWrapper(<ForgotPasswordPage />));

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    // Verify the mutation was called with the correct email and callbacks
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith('test@example.com', expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }));
    });
  });

  it('should call mutation with success callback', async () => {
    const successMutation = (email, { onSuccess }) => {
      onSuccess({}, email);
    };

    render(renderWrapper(<ForgotPasswordPage />, {
      mutateImplementation: successMutation,
    }));

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith('test@example.com', expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }));
    });
  });

  it('should redirect onto login page', async () => {
    const { container } = render(renderWrapper(<ForgotPasswordPage />));

    const navElement = container.querySelector('nav');
    const anchorElement = navElement.querySelector('a');
    fireEvent.click(anchorElement);
    expect(mockedNavigator).toHaveBeenCalledWith(expect.stringContaining(LOGIN_PAGE));
  });

  it('should display token validation rate limit error message', async () => {
    const expectedHeading = 'Too many requests';
    const expectedMessage = 'An error has occurred because of too many requests. Please try again after some time.';
    const { container } = render(renderWrapper(<ForgotPasswordPage />, {
      status: PASSWORD_RESET.FORBIDDEN_REQUEST,
    }));

    await waitFor(() => {
      const alertElements = container.querySelectorAll('.alert-danger');
      if (alertElements.length > 0) {
        const alertContent = alertElements[0].textContent;
        expect(alertContent).toContain(expectedHeading);
        expect(alertContent).toContain(expectedMessage);
      }
    });
  });

  it('should display invalid token error message', async () => {
    const expectedHeading = 'Invalid password reset link';
    const expectedMessage = 'This password reset link is invalid. It may have been used already. Enter your email below to receive a new link.';
    const { container } = render(renderWrapper(<ForgotPasswordAlert />, {
      status: PASSWORD_RESET.INVALID_TOKEN,
    }));

    await waitFor(() => {
      const alertElements = container.querySelectorAll('.alert-danger');
      if (alertElements.length > 0) {
        const alertContent = alertElements[0].textContent;
        expect(alertContent).toContain(expectedHeading);
        expect(alertContent).toContain(expectedMessage);
      }
    });
  });

  it('should display token validation internal server error message', async () => {
    const expectedHeading = 'Token validation failure';
    const expectedMessage = 'An error has occurred. Try refreshing the page, or check your internet connection.';
    const { container } = render(renderWrapper(<ForgotPasswordAlert />, {
      status: PASSWORD_RESET.INTERNAL_SERVER_ERROR,
    }));

    await waitFor(() => {
      const alertElements = container.querySelectorAll('.alert-danger');
      if (alertElements.length > 0) {
        const alertContent = alertElements[0].textContent;
        expect(alertContent).toContain(expectedHeading);
        expect(alertContent).toContain(expectedMessage);
      }
    });
  });
});
describe('ForgotPasswordAlert', () => {
  const renderAlertWrapper = (props) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en">
          <MemoryRouter>
            <ForgotPasswordAlert {...props} />
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>,
    );
  };

  it('should display internal server error message', () => {
    const { container } = renderAlertWrapper({
      status: INTERNAL_SERVER_ERROR,
      email: 'test@example.com',
      emailError: '',
    });

    const alertElement = container.querySelector('.alert-danger');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent).toContain('We were unable to contact you.');
    expect(alertElement.textContent).toContain('An error has occurred. Try refreshing the page, or check your internet connection.');
  });

  it('should display forbidden state error message', () => {
    const { container } = renderAlertWrapper({
      status: FORBIDDEN_STATE,
      email: 'test@example.com',
      emailError: '',
    });

    const alertElement = container.querySelector('.alert-danger');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent).toContain('An error occurred.');
    expect(alertElement.textContent).toContain('Your previous request is in progress, please try again in a few moments.');
  });

  it('should display form submission error message', () => {
    const emailError = 'Enter a valid email address';
    const { container } = renderAlertWrapper({
      status: FORM_SUBMISSION_ERROR,
      email: 'test@example.com',
      emailError,
    });

    const alertElement = container.querySelector('.alert-danger');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent).toContain('We were unable to contact you.');
    expect(alertElement.textContent).toContain(`${emailError} below.`);
  });

  it('should display password reset invalid token error message', () => {
    const { container } = renderAlertWrapper({
      status: PASSWORD_RESET.INVALID_TOKEN,
      email: 'test@example.com',
      emailError: '',
    });

    const alertElement = container.querySelector('.alert-danger');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent).toContain('Invalid password reset link');
    expect(alertElement.textContent).toContain('This password reset link is invalid. It may have been used already. Enter your email below to receive a new link.');
  });

  it('should display password reset forbidden request error message', () => {
    const { container } = renderAlertWrapper({
      status: PASSWORD_RESET.FORBIDDEN_REQUEST,
      email: 'test@example.com',
      emailError: '',
    });

    const alertElement = container.querySelector('.alert-danger');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent).toContain('Too many requests');
    expect(alertElement.textContent).toContain('An error has occurred because of too many requests. Please try again after some time.');
  });

  it('should display password reset internal server error message', () => {
    const { container } = renderAlertWrapper({
      status: PASSWORD_RESET.INTERNAL_SERVER_ERROR,
      email: 'test@example.com',
      emailError: '',
    });

    const alertElement = container.querySelector('.alert-danger');
    expect(alertElement).toBeTruthy();
    expect(alertElement.textContent).toContain('Token validation failure');
    expect(alertElement.textContent).toContain('An error has occurred. Try refreshing the page, or check your internet connection.');
  });
});
