import React from 'react';

import { logError, logInfo } from '@edx/frontend-platform/logging';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import * as api from './api';
import { useForgotPassword } from './apiHook';

// Mock the logging functions
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

// Mock the API function
jest.mock('./api', () => ({
  forgotPassword: jest.fn(),
}));

const mockForgotPassword = api.forgotPassword as jest.MockedFunction<typeof api.forgotPassword>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockLogInfo = logInfo as jest.MockedFunction<typeof logInfo>;

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should send forgot password email successfully and log success', async () => {
    const testEmail = 'test@example.com';
    const mockResponse = {
      message: 'Password reset email sent successfully',
      success: true,
    };

    mockForgotPassword.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(testEmail);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockForgotPassword).toHaveBeenCalledWith(testEmail);
    expect(mockLogInfo).toHaveBeenCalledWith(`Forgot password email sent to ${testEmail}`);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle 403 forbidden error and log as info', async () => {
    const testEmail = 'blocked@example.com';
    const mockError = {
      response: {
        status: 403,
        data: {
          detail: 'Too many password reset attempts',
        },
      },
      message: 'Forbidden',
    };

    mockForgotPassword.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(testEmail);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockForgotPassword).toHaveBeenCalledWith(testEmail);
    expect(mockLogInfo).toHaveBeenCalledWith(mockError);
    expect(mockLogError).not.toHaveBeenCalled();
    expect(result.current.error).toEqual(mockError);
  });

  it('should handle network errors without response and log as error', async () => {
    const testEmail = 'test@example.com';
    const networkError = new Error('Network Error');
    networkError.name = 'NetworkError';

    mockForgotPassword.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(testEmail);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockForgotPassword).toHaveBeenCalledWith(testEmail);
    expect(mockLogError).toHaveBeenCalledWith(networkError);
    expect(mockLogInfo).not.toHaveBeenCalled();
    expect(result.current.error).toEqual(networkError);
  });

  it('should handle empty email address', async () => {
    const testEmail = '';
    const mockResponse = {
      message: 'Email sent',
      success: true,
    };

    mockForgotPassword.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(testEmail);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockForgotPassword).toHaveBeenCalledWith('');
    expect(mockLogInfo).toHaveBeenCalledWith('Forgot password email sent to ');
  });

  it('should handle email with special characters', async () => {
    const testEmail = 'user+test@example-domain.co.uk';
    const mockResponse = {
      message: 'Password reset email sent',
      success: true,
    };

    mockForgotPassword.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(testEmail);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockForgotPassword).toHaveBeenCalledWith(testEmail);
    expect(mockLogInfo).toHaveBeenCalledWith(`Forgot password email sent to ${testEmail}`);
    expect(result.current.data).toEqual(mockResponse);
  });
});
