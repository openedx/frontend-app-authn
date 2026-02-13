import React from 'react';

import { camelCaseObject } from '@edx/frontend-platform';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { getFieldsValidations, registerNewUserApi } from './api';
import { useFieldValidations, useRegistration } from './apiHook';
import { INTERNAL_SERVER_ERROR } from './constants';

jest.mock('@edx/frontend-platform', () => ({
  camelCaseObject: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock('./api', () => ({
  registerNewUserApi: jest.fn(),
  getFieldsValidations: jest.fn(),
}));

describe('API Hooks', () => {
  let queryClient: QueryClient;
  let wrapper: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

    (camelCaseObject as jest.MockedFunction<typeof camelCaseObject>).mockImplementation((obj) => obj);
  });

  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('useRegistration', () => {
    const mockRegistrationPayload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword',
    };

    const mockSuccessResponse = {
      redirectUrl: '/dashboard',
      success: true,
      authenticatedUser: {
        username: 'testuser',
        full_name: 'Test User',
        user_id: 123,
      },
    };

    it('should call onSuccess when registration is successful', async () => {
      const mockOnSuccess = jest.fn();
      const mockOnError = jest.fn();

      (registerNewUserApi as jest.MockedFunction<typeof registerNewUserApi>)
        .mockResolvedValue(mockSuccessResponse);

      const { result } = renderHook(() => useRegistration({ onSuccess: mockOnSuccess, onError: mockOnError }),
        { wrapper });

      result.current.mutate(mockRegistrationPayload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(registerNewUserApi).toHaveBeenCalledWith(mockRegistrationPayload);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockSuccessResponse);
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should handle 400/403/409 errors with camelCase transformation and logInfo', async () => {
      const mockOnSuccess = jest.fn();
      const mockOnError = jest.fn();
      const mockErrorResponse = {
        response: {
          status: 400,
          data: {
            field_errors: {
              email: ['Email already exists'],
            },
          },
        },
      };

      const mockTransformedError = {
        fieldErrors: {
          email: ['Email already exists'],
        },
      };

      (registerNewUserApi as jest.MockedFunction<typeof registerNewUserApi>)
        .mockRejectedValue(mockErrorResponse);
      (camelCaseObject as jest.MockedFunction<typeof camelCaseObject>)
        .mockReturnValue(mockTransformedError);

      const { result } = renderHook(() => useRegistration({ onSuccess: mockOnSuccess, onError: mockOnError }),
        { wrapper });

      result.current.mutate(mockRegistrationPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(camelCaseObject).toHaveBeenCalledWith(mockErrorResponse.response.data);
      expect(logInfo).toHaveBeenCalledWith(mockErrorResponse);
      expect(logError).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(mockTransformedError);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should handle 403 status code specifically', async () => {
      const mockOnError = jest.fn();
      const mockErrorResponse = {
        response: {
          status: 403,
          data: { detail: 'Forbidden' },
        },
      };

      (registerNewUserApi as jest.MockedFunction<typeof registerNewUserApi>)
        .mockRejectedValue(mockErrorResponse);

      const { result } = renderHook(() => useRegistration({ onError: mockOnError }), { wrapper });

      result.current.mutate(mockRegistrationPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(logInfo).toHaveBeenCalledWith(mockErrorResponse);
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle 409 status code specifically', async () => {
      const mockOnError = jest.fn();
      const mockErrorResponse = {
        response: {
          status: 409,
          data: { conflict: 'User already exists' },
        },
      };

      (registerNewUserApi as jest.MockedFunction<typeof registerNewUserApi>)
        .mockRejectedValue(mockErrorResponse);

      const { result } = renderHook(() => useRegistration({ onError: mockOnError }), { wrapper });

      result.current.mutate(mockRegistrationPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(logInfo).toHaveBeenCalledWith(mockErrorResponse);
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle other HTTP status codes with internal server error', async () => {
      const mockOnSuccess = jest.fn();
      const mockOnError = jest.fn();
      const mockErrorResponse = {
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      };

      (registerNewUserApi as jest.MockedFunction<typeof registerNewUserApi>)
        .mockRejectedValue(mockErrorResponse);

      const { result } = renderHook(() => useRegistration({ onSuccess: mockOnSuccess, onError: mockOnError }),
        { wrapper });

      result.current.mutate(mockRegistrationPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(logError).toHaveBeenCalledWith(mockErrorResponse);
      expect(logInfo).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith({ errorCode: INTERNAL_SERVER_ERROR });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should handle non-HTTP errors with internal server error', async () => {
      const mockOnError = jest.fn();
      const networkError = new Error('Network error');

      (registerNewUserApi as jest.MockedFunction<typeof registerNewUserApi>)
        .mockRejectedValue(networkError);

      const { result } = renderHook(() => useRegistration({ onError: mockOnError }), { wrapper });

      result.current.mutate(mockRegistrationPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(logError).toHaveBeenCalledWith(networkError);
      expect(logInfo).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith({ errorCode: INTERNAL_SERVER_ERROR });
    });

    it('should handle missing response data', async () => {
      const mockOnError = jest.fn();
      const mockErrorResponse = {
        response: {
          status: 400,
        },
      };

      (registerNewUserApi as jest.MockedFunction<typeof registerNewUserApi>)
        .mockRejectedValue(mockErrorResponse);

      const { result } = renderHook(() => useRegistration({ onError: mockOnError }), { wrapper });

      result.current.mutate(mockRegistrationPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(camelCaseObject).toHaveBeenCalledWith({});
      expect(logInfo).toHaveBeenCalledWith(mockErrorResponse);
    });

    it('should work without onSuccess and onError callbacks', async () => {
      (registerNewUserApi as jest.MockedFunction<typeof registerNewUserApi>)
        .mockResolvedValue(mockSuccessResponse);

      const { result } = renderHook(() => useRegistration(), { wrapper });

      result.current.mutate(mockRegistrationPayload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(registerNewUserApi).toHaveBeenCalledWith(mockRegistrationPayload);
    });
  });

  describe('useFieldValidations', () => {
    const mockPayload = {
      username: 'testuser',
      email: 'test@example.com',
    };

    const mockSuccessResponse = {
      fieldValidations: {
        username: ['Username is available'],
        validation_decisions: {
          username: '',
        },
      },
    };

    const mockTransformedData = {
      username: ['Username is available'],
      validationDecisions: {
        username: '',
      },
    };

    it('should call onSuccess with transformed data when validation is successful', async () => {
      const mockOnSuccess = jest.fn();
      const mockOnError = jest.fn();

      (getFieldsValidations as jest.MockedFunction<typeof getFieldsValidations>)
        .mockResolvedValue(mockSuccessResponse);
      (camelCaseObject as jest.MockedFunction<typeof camelCaseObject>)
        .mockReturnValue(mockTransformedData);

      const { result } = renderHook(() => useFieldValidations({ onSuccess: mockOnSuccess, onError: mockOnError }),
        { wrapper });

      result.current.mutate(mockPayload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(getFieldsValidations).toHaveBeenCalledWith(mockPayload);
      expect(camelCaseObject).toHaveBeenCalledWith(mockSuccessResponse.fieldValidations);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockTransformedData);
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should handle 403 errors as rate limited with logInfo', async () => {
      const mockOnSuccess = jest.fn();
      const mockOnError = jest.fn();
      const mockErrorResponse = {
        response: {
          status: 403,
        },
      };

      (getFieldsValidations as jest.MockedFunction<typeof getFieldsValidations>)
        .mockRejectedValue(mockErrorResponse);

      const { result } = renderHook(() => useFieldValidations({ onSuccess: mockOnSuccess, onError: mockOnError }),
        { wrapper });

      result.current.mutate(mockPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(logInfo).toHaveBeenCalledWith(mockErrorResponse);
      expect(logError).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith({ validationApiRateLimited: true });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should handle other HTTP status codes with logError', async () => {
      const mockOnError = jest.fn();
      const mockErrorResponse = {
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      };

      (getFieldsValidations as jest.MockedFunction<typeof getFieldsValidations>)
        .mockRejectedValue(mockErrorResponse);

      const { result } = renderHook(() => useFieldValidations({ onError: mockOnError }), { wrapper });

      result.current.mutate(mockPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(logError).toHaveBeenCalledWith(mockErrorResponse);
      expect(logInfo).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(mockErrorResponse);
    });

    it('should handle non-HTTP errors with logError', async () => {
      const mockOnError = jest.fn();
      const networkError = new Error('Network error');

      (getFieldsValidations as jest.MockedFunction<typeof getFieldsValidations>)
        .mockRejectedValue(networkError);

      const { result } = renderHook(() => useFieldValidations({ onError: mockOnError }), { wrapper });

      result.current.mutate(mockPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(logError).toHaveBeenCalledWith(networkError);
      expect(logInfo).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(networkError);
    });

    it('should work without onSuccess and onError callbacks', async () => {
      (getFieldsValidations as jest.MockedFunction<typeof getFieldsValidations>)
        .mockResolvedValue(mockSuccessResponse);

      const { result } = renderHook(() => useFieldValidations(), { wrapper });

      result.current.mutate(mockPayload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(getFieldsValidations).toHaveBeenCalledWith(mockPayload);
      expect(camelCaseObject).toHaveBeenCalledWith(mockSuccessResponse.fieldValidations);
    });

    it('should handle errors when callbacks are not provided', async () => {
      const mockErrorResponse = {
        response: {
          status: 403,
        },
      };

      (getFieldsValidations as jest.MockedFunction<typeof getFieldsValidations>)
        .mockRejectedValue(mockErrorResponse);

      const { result } = renderHook(() => useFieldValidations(), { wrapper });

      result.current.mutate(mockPayload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(logInfo).toHaveBeenCalledWith(mockErrorResponse);
    });
  });
});
