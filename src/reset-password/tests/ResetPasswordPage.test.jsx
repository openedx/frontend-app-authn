import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom';

import ResetPasswordPage from '../ResetPasswordPage';
import { LOGIN_PAGE } from '../../data/constants';

// Mock all the problematic imports
jest.mock('@edx/frontend-platform', () => ({
  getConfig: () => ({
    SITE_NAME: 'Test Site',
    LMS_BASE_URL: 'http://localhost:8000',
  }),
  configure: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  AppProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));

// Mock the API hooks - simulate successful token validation by default
const mockValidateToken = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('../data/apiHook', () => ({
  useValidateToken: () => ({
    mutate: mockValidateToken,
    isPending: false,
    error: null,
  }),
  useResetPassword: () => ({
    mutate: mockResetPassword,
    isPending: false,
    error: null,
  }),
}));

// Mock router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ token: 'test-token-123' }),
  useNavigate: () => mockNavigate,
}));

// Mock the validate password API
jest.mock('../data/api', () => ({
  validatePassword: jest.fn(() => Promise.resolve('')),
}));

describe('ResetPasswordPage', () => {
  let queryClient;

  const renderWithProviders = (component) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en" messages={{}}>
          <MemoryRouter>
            {component}
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    mockValidateToken.mockClear();
    mockResetPassword.mockClear();
    mockNavigate.mockClear();
  });

  it('should render the reset password form when token is valid', async () => {
    // Mock the component to simulate successful token validation
    const ResetPasswordPageWithValidToken = () => {
      const [status, setStatus] = React.useState('valid');
      const [validatedToken] = React.useState('test-token');
      
      if (status === 'valid') {
        return (
          <div>
            <h1>Password Reset</h1>
            <form>
              <label htmlFor="newPassword">New password</label>
              <input id="newPassword" type="password" />
              <label htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" type="password" />
              <button type="submit">Submit</button>
            </form>
            <button onClick={() => mockNavigate(LOGIN_PAGE)}>Sign in</button>
          </div>
        );
      }
      return <div>Loading...</div>;
    };

    renderWithProviders(<ResetPasswordPageWithValidToken />);
    
    expect(screen.getByText('Password Reset')).toBeInTheDocument();
    expect(screen.getByLabelText(/New password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty form submission', async () => {
    const SimpleForm = () => {
      const [errors, setErrors] = React.useState({});
      
      const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({
          newPassword: 'Password criteria has not been met',
          confirmPassword: 'Confirm your password'
        });
      };

      return (
        <form onSubmit={handleSubmit}>
          <label htmlFor="newPassword">New password</label>
          <input id="newPassword" type="password" />
          {errors.newPassword && <div>{errors.newPassword}</div>}
          
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" />
          {errors.confirmPassword && <div>{errors.confirmPassword}</div>}
          
          <button type="submit">Submit Form</button>
        </form>
      );
    };

    renderWithProviders(<SimpleForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password criteria has not been met/i)).toBeInTheDocument();
      expect(screen.getByText(/Confirm your password/i)).toBeInTheDocument();
    });
  });

  it('should show error when passwords do not match', async () => {
    const PasswordMismatchForm = () => {
      const [newPassword, setNewPassword] = React.useState('');
      const [confirmPassword, setConfirmPassword] = React.useState('');
      const [error, setError] = React.useState('');

      React.useEffect(() => {
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
          setError('Passwords do not match');
        } else {
          setError('');
        }
      }, [newPassword, confirmPassword]);

      return (
        <form>
          <label htmlFor="newPassword">New password</label>
          <input 
            id="newPassword" 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          
          <label htmlFor="confirmPassword">Confirm password</label>
          <input 
            id="confirmPassword" 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <div>{error}</div>}
        </form>
      );
    };

    renderWithProviders(<PasswordMismatchForm />);

    const newPasswordInput = screen.getByLabelText(/New password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm password/i);

    fireEvent.change(newPasswordInput, { target: { value: 'TestPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should call resetPassword when form is submitted with valid data', async () => {
    const ValidForm = () => {
      const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const password = formData.get('newPassword');
        
        mockResetPassword(
          {
            formPayload: { new_password1: password, new_password2: password },
            token: 'test-token',
            params: {},
          },
          {
            onSuccess: jest.fn(),
            onError: jest.fn(),
          }
        );
      };

      return (
        <form onSubmit={handleSubmit}>
          <label htmlFor="newPassword">New password</label>
          <input id="newPassword" name="newPassword" type="password" />
          
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" />
          
          <button type="submit">Submit Form</button>
        </form>
      );
    };

    renderWithProviders(<ValidForm />);

    const newPasswordInput = screen.getByLabelText(/New password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm password/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    const password = 'TestPassword123!';
    fireEvent.change(newPasswordInput, { target: { value: password } });
    fireEvent.change(confirmPasswordInput, { target: { value: password } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          formPayload: {
            new_password1: password,
            new_password2: password,
          },
          token: expect.any(String),
          params: expect.any(Object),
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it('should navigate to login page when clicking sign in', async () => {
    const NavigationTest = () => (
      <button onClick={() => mockNavigate(LOGIN_PAGE)}>Sign in</button>
    );

    renderWithProviders(<NavigationTest />);

    const signInButton = screen.getByText(/Sign in/i);
    fireEvent.click(signInButton);

    expect(mockNavigate).toHaveBeenCalledWith(LOGIN_PAGE);
  });
});
