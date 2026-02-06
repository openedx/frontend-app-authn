import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useSaveUserProfile } from './apiHook';
import * as api from './api';
import { useProgressiveProfilingContext } from '../components/ProgressiveProfilingContext';
import { DEFAULT_STATE, PENDING_STATE } from '../../data/constants';

// Mock the API function
jest.mock('./api', () => ({
  patchAccount: jest.fn(),
}));

// Mock the progressive profiling context
jest.mock('../components/ProgressiveProfilingContext', () => ({
  useProgressiveProfilingContext: jest.fn(),
}));

const mockPatchAccount = api.patchAccount as jest.MockedFunction<typeof api.patchAccount>;
const mockUseProgressiveProfilingContext = useProgressiveProfilingContext as jest.MockedFunction<typeof useProgressiveProfilingContext>;

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

describe('useSaveUserProfile', () => {
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();
  const mockSetSuccess = jest.fn();
  const mockSetSubmitState = jest.fn();

  const mockContextValue = {
    setLoading: mockSetLoading,
    setError: mockSetError,
    setSuccess: mockSetSuccess,
    setSubmitState: mockSetSubmitState,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProgressiveProfilingContext.mockReturnValue(mockContextValue);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSaveUserProfile(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should save user profile successfully', async () => {
    const mockPayload = {
      username: 'testuser123',
      data: {
        gender: 'm',
        extended_profile: [
          { field_name: 'company', field_value: 'Test Company' }
        ]
      }
    };
    const mockResponse = { success: true };

    mockPatchAccount.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useSaveUserProfile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check loading state was set during mutation
    expect(mockSetLoading).toHaveBeenCalledWith(true);

    // Check API was called correctly
    expect(mockPatchAccount).toHaveBeenCalledWith(mockPayload.username, mockPayload.data);

    // Check success state is set
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockSetSuccess).toHaveBeenCalledWith(true);
    expect(mockSetSubmitState).toHaveBeenCalledWith(DEFAULT_STATE);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle API error and set error state', async () => {
    const mockPayload = {
      username: 'testuser123',
      data: { gender: 'm' }
    };
    const mockError = new Error('Failed to save profile');

    mockPatchAccount.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useSaveUserProfile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check loading state was set during mutation
    expect(mockSetLoading).toHaveBeenCalledWith(true);

    // Check API was called
    expect(mockPatchAccount).toHaveBeenCalledWith(mockPayload.username, mockPayload.data);

    // Check error state is set
    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockSetError).toHaveBeenCalledWith('Failed to save profile');
    expect(mockSetSubmitState).toHaveBeenCalledWith(PENDING_STATE);
    expect(result.current.error).toEqual(mockError);
  });

  it('should handle non-Error objects and set generic error message', async () => {
    const mockPayload = {
      username: 'testuser123',
      data: { gender: 'm' }
    };
    const mockError = { message: 'Something went wrong', status: 500 };

    mockPatchAccount.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useSaveUserProfile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check generic error message is set for non-Error objects
    expect(mockSetError).toHaveBeenCalledWith('An error occurred while saving profile');
    expect(mockSetSubmitState).toHaveBeenCalledWith(PENDING_STATE);
  });

  it('should properly handle extended_profile data structure', async () => {
    const mockPayload = {
      username: 'testuser123',
      data: {
        gender: 'f',
        extended_profile: [
          { field_name: 'company', field_value: 'Acme Corp' },
          { field_name: 'level_of_education', field_value: 'Bachelor\'s Degree' }
        ]
      }
    };
    const mockResponse = { success: true, updated_fields: ['gender', 'extended_profile'] };

    mockPatchAccount.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useSaveUserProfile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPatchAccount).toHaveBeenCalledWith(mockPayload.username, mockPayload.data);
    expect(mockSetSuccess).toHaveBeenCalledWith(true);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle network errors gracefully', async () => {
    const mockPayload = {
      username: 'testuser123',
      data: { gender: 'm' }
    };
    const networkError = new Error('Network Error');
    networkError.name = 'NetworkError';

    mockPatchAccount.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useSaveUserProfile(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockSetError).toHaveBeenCalledWith('Network Error');
    expect(mockSetSubmitState).toHaveBeenCalledWith(PENDING_STATE);
  });

  it('should reset states correctly on each mutation attempt', async () => {
    const mockPayload = {
      username: 'testuser123',
      data: { gender: 'm' }
    };

    mockPatchAccount.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useSaveUserProfile(), {
      wrapper: createWrapper(),
    });

    // First mutation
    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);

    jest.clearAllMocks();
    mockPatchAccount.mockResolvedValueOnce({ success: true });

    // Second mutation
    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);

    expect(mockSetLoading).toHaveBeenCalledWith(false);
    expect(mockSetSuccess).toHaveBeenCalledWith(true);
  });
});