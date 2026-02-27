import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { logError, logInfo } from '@edx/frontend-platform/logging';

import * as api from './api';
import { useValidateToken, useResetPassword } from './apiHook';

// Mock the logging functions
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

// Mock the API functions
jest.mock('./api', () => ({
  validateToken: jest.fn(),
  resetPassword: jest.fn(),
}));

const mockValidateToken = api.validateToken as jest.MockedFunction<typeof api.validateToken>;
const mockResetPassword = api.resetPassword as jest.MockedFunction<typeof api.resetPassword>;
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

describe('useValidateToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate token successfully and log success', async () => {
    const mockToken = 'valid-token-123';
    const mockResponse = { is_valid: true, message: 'Token is valid' };
    
    mockValidateToken.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useValidateToken(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockToken);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockValidateToken).toHaveBeenCalledWith(mockToken);
    expect(mockLogInfo).toHaveBeenCalledWith('Token valid-token-123 is valid');
    expect(result.current.data).toEqual({ ...mockResponse, token: mockToken });
  });

  it('should handle invalid token and log appropriately', async () => {
    const mockToken = 'invalid-token-123';
    const mockResponse = { is_valid: false, message: 'Token is invalid' };
    
    mockValidateToken.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useValidateToken(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockToken);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockValidateToken).toHaveBeenCalledWith(mockToken);
    expect(mockLogInfo).toHaveBeenCalledWith('Token invalid-token-123 is invalid');
    expect(result.current.data).toEqual({ ...mockResponse, token: mockToken });
  });

  it('should handle API error with 429 status and log info', async () => {
    const mockToken = 'test-token';
    const mockError = {
      response: { status: 429 },
      message: 'Rate limit exceeded',
    };
    
    mockValidateToken.mockRejectedValueOnce(mockError);
    
    const { result } = renderHook(() => useValidateToken(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockToken);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockValidateToken).toHaveBeenCalledWith(mockToken);
    expect(mockLogInfo).toHaveBeenCalledWith(mockError);
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('should handle general API error and log error', async () => {
    const mockToken = 'test-token';
    const mockError = {
      response: { status: 500 },
      message: 'Internal server error',
    };
    
    mockValidateToken.mockRejectedValueOnce(mockError);
    
    const { result } = renderHook(() => useValidateToken(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockToken);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockValidateToken).toHaveBeenCalledWith(mockToken);
    expect(mockLogError).toHaveBeenCalledWith(mockError);
    expect(mockLogInfo).not.toHaveBeenCalled();
  });
});

describe('useResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reset password successfully and log success', async () => {
    const mockPayload = {
      formPayload: { new_password1: 'newpassword123', new_password2: 'newpassword123' },
      token: 'reset-token-123',
      params: { is_account_recovery: false },
    };
    const mockResponse = { 
      reset_status: true, 
      err_msg: null, 
      token_invalid: false,
      message: 'Password reset successful' 
    };
    
    mockResetPassword.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      mockPayload.formPayload,
      mockPayload.token,
      mockPayload.params
    );
    expect(mockLogInfo).toHaveBeenCalledWith('Password reset successful');
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle invalid token during password reset', async () => {
    const mockPayload = {
      formPayload: { new_password1: 'newpassword123', new_password2: 'newpassword123' },
      token: 'invalid-token',
      params: { is_account_recovery: false },
    };
    const mockResponse = { 
      reset_status: false, 
      err_msg: null, 
      token_invalid: true,
      message: 'Token is invalid' 
    };
    
    mockResetPassword.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      mockPayload.formPayload,
      mockPayload.token,
      mockPayload.params
    );
    expect(mockLogInfo).toHaveBeenCalledWith('Password reset failed: invalid token');
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle validation errors during password reset', async () => {
    const mockPayload = {
      formPayload: { new_password1: 'weak', new_password2: 'weak' },
      token: 'valid-token',
      params: { is_account_recovery: false },
    };
    const mockErrors = ['Password is too weak'];
    const mockResponse = { 
      reset_status: false, 
      err_msg: mockErrors, 
      token_invalid: false,
      message: 'Validation failed' 
    };
    
    mockResetPassword.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      mockPayload.formPayload,
      mockPayload.token,
      mockPayload.params
    );
    expect(mockLogInfo).toHaveBeenCalledWith('Password reset failed: validation error', mockErrors);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle API error with 429 status and log info', async () => {
    const mockPayload = {
      formPayload: { new_password1: 'newpassword123', new_password2: 'newpassword123' },
      token: 'test-token',
      params: { is_account_recovery: false },
    };
    const mockError = {
      response: { status: 429 },
      message: 'Rate limit exceeded',
    };
    
    mockResetPassword.mockRejectedValueOnce(mockError);
    
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      mockPayload.formPayload,
      mockPayload.token,
      mockPayload.params
    );
    expect(mockLogInfo).toHaveBeenCalledWith(mockError);
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('should handle general API error and log error', async () => {
    const mockPayload = {
      formPayload: { new_password1: 'newpassword123', new_password2: 'newpassword123' },
      token: 'test-token',
      params: { is_account_recovery: false },
    };
    const mockError = {
      response: { status: 500 },
      message: 'Internal server error',
    };
    
    mockResetPassword.mockRejectedValueOnce(mockError);
    
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      mockPayload.formPayload,
      mockPayload.token,
      mockPayload.params
    );
    expect(mockLogError).toHaveBeenCalledWith(mockError);
    expect(mockLogInfo).not.toHaveBeenCalled();
  });

  it('should handle account recovery parameter correctly', async () => {
    const mockPayload = {
      formPayload: { new_password1: 'newpassword123', new_password2: 'newpassword123' },
      token: 'recovery-token',
      params: { is_account_recovery: true },
    };
    const mockResponse = { 
      reset_status: true, 
      err_msg: null, 
      token_invalid: false 
    };
    
    mockResetPassword.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockResetPassword).toHaveBeenCalledWith(
      mockPayload.formPayload,
      mockPayload.token,
      { is_account_recovery: true }
    );
    expect(mockLogInfo).toHaveBeenCalledWith('Password reset successful');
  });
});