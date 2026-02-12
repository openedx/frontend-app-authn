import React from 'react';

import { logError, logInfo } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import * as api from './api';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_FORM,
  useLogin,
} from './apiHook';

// Mock the dependencies
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock('@edx/frontend-platform/utils', () => ({
  camelCaseObject: jest.fn(),
}));

jest.mock('./api', () => ({
  login: jest.fn(),
}));

const mockLogin = api.login as jest.MockedFunction<typeof api.login>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockLogInfo = logInfo as jest.MockedFunction<typeof logInfo>;
const mockCamelCaseObject = camelCaseObject as jest.MockedFunction<typeof camelCaseObject>;

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

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCamelCaseObject.mockImplementation((obj) => obj);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should login successfully and log success', async () => {
    const mockLoginData = {
      email_or_username: 'testuser@example.com',
      password: 'password123',
    };
    const mockResponse = {
      redirectUrl: 'http://localhost:18000/dashboard',
      success: true,
    };

    mockLogin.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockLoginData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockLogin).toHaveBeenCalledWith(mockLoginData);
    expect(mockLogInfo).toHaveBeenCalledWith('Login successful', mockResponse);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle 400 validation error and transform to INVALID_FORM', async () => {
    const mockLoginData = {
      email_or_username: '',
      password: 'password123',
    };
    const mockErrorResponse = {
      errorCode: INVALID_FORM,
      context: {
        email_or_username: ['This field is required'],
        password: ['Password is too weak'],
      },
    };
    const mockCamelCasedResponse = {
      errorCode: INVALID_FORM,
      context: {
        emailOrUsername: ['This field is required'],
        password: ['Password is too weak'],
      },
    };

    const mockError = {
      response: {
        status: 400,
        data: mockErrorResponse,
      },
    };

    // Mock onError callback to test formatted error
    const mockOnError = jest.fn();

    mockLogin.mockRejectedValueOnce(mockError);
    mockCamelCaseObject.mockReturnValueOnce({
      status: 400,
      data: mockCamelCasedResponse,
    });

    const { result } = renderHook(() => useLogin({ onError: mockOnError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockLoginData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockLogin).toHaveBeenCalledWith(mockLoginData);
    expect(mockCamelCaseObject).toHaveBeenCalledWith({
      status: 400,
      data: mockErrorResponse,
    });
    expect(mockLogInfo).toHaveBeenCalledWith('Login failed with validation error', mockError);
    expect(mockOnError).toHaveBeenCalledWith({
      type: INVALID_FORM,
      context: {
        emailOrUsername: ['This field is required'],
        password: ['Password is too weak'], 
      },
      count: 0,
    });
  });

  it('should handle timeout errors', async () => {
    const mockLoginData = {
      email_or_username: 'testuser@example.com',
      password: 'password123',
    };

    const timeoutError = new Error('Request timeout');
    timeoutError.name = 'TimeoutError';

    // Mock onError callback to test formatted error
    const mockOnError = jest.fn();

    mockLogin.mockRejectedValueOnce(timeoutError);

    const { result } = renderHook(() => useLogin({ onError: mockOnError }), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockLoginData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockLogError).toHaveBeenCalledWith('Login failed', timeoutError);
    expect(mockOnError).toHaveBeenCalledWith({
      type: INTERNAL_SERVER_ERROR,
      context: {},
      count: 0,
    });
  });

  it('should handle successful login with custom redirect URL', async () => {
    const mockLoginData = {
      email_or_username: 'testuser@example.com',
      password: 'password123',
    };
    const mockResponse = {
      redirectUrl: 'http://localhost:18000/courses',
      success: true,
    };

    mockLogin.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockLoginData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockLogInfo).toHaveBeenCalledWith('Login successful', mockResponse);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle login with empty credentials', async () => {
    const mockLoginData = {
      email_or_username: '',
      password: '',
    };
    const mockResponse = {
      redirectUrl: 'http://localhost:18000/dashboard',
      success: false,
    };

    mockLogin.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockLoginData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(mockLogInfo).toHaveBeenCalledWith('Login successful', mockResponse);
  });
});
