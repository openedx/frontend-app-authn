import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from '../useLogin';
import { login } from '../../api';

// Mock the loginApi
jest.mock('../../api/loginApi');

// Mock logging functions
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

describe('useLogin', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should handle successful login', async () => {
    const mockLoginResponse = {
      redirectUrl: 'http://example.com/dashboard',
      success: true,
    };
    
    const onSuccess = jest.fn();
    const onError = jest.fn();
    
    loginApi.login.mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(
      () => useLogin({ onSuccess, onError }),
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        email_or_username: 'test@example.com',
        password: 'password123',
      });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(onSuccess).toHaveBeenCalledWith(mockLoginResponse);
    expect(onError).not.toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(true);
  });

  it('should handle login failure with validation error', async () => {
    const mockError = {
      response: {
        status: 400,
        data: {
          error_code: 'invalid-credentials',
          context: { email: 'test@example.com' },
        },
      },
    };
    
    const onSuccess = jest.fn();
    const onError = jest.fn();
    
    loginApi.login.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useLogin({ onSuccess, onError }),
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        email_or_username: 'test@example.com',
        password: 'wrongpassword',
      });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(onError).toHaveBeenCalledWith({
      errorCode: 'invalid-credentials',
      context: { email: 'test@example.com' },
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.isError).toBe(true);
  });

  it('should handle forbidden error', async () => {
    const mockError = {
      response: {
        status: 403,
        data: {},
      },
    };
    
    const onError = jest.fn();
    
    loginApi.login.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useLogin({ onError }),
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        email_or_username: 'test@example.com',
        password: 'password123',
      });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(onError).toHaveBeenCalledWith({
      errorCode: 'forbidden-request',
    });
  });

  it('should handle internal server error', async () => {
    const mockError = {
      response: {
        status: 500,
        data: {},
      },
    };
    
    const onError = jest.fn();
    
    loginApi.login.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useLogin({ onError }),
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        email_or_username: 'test@example.com',
        password: 'password123',
      });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(onError).toHaveBeenCalledWith({
      errorCode: 'internal-server-error',
    });
  });

  it('should handle network error', async () => {
    const mockError = new Error('Network error');
    
    const onError = jest.fn();
    
    loginApi.login.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useLogin({ onError }),
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        email_or_username: 'test@example.com',
        password: 'password123',
      });
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(onError).toHaveBeenCalledWith({
      errorCode: 'internal-server-error',
    });
  });
});