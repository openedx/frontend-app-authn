import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { patchAccount } from './api';

// Mock the platform dependencies
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;
const mockGetAuthenticatedHttpClient = getAuthenticatedHttpClient as jest.MockedFunction<typeof getAuthenticatedHttpClient>;

describe('progressive-profiling api', () => {
  const mockHttpClient = {
    patch: jest.fn(),
  };

  const mockConfig = {
    LMS_BASE_URL: 'http://localhost:18000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig.mockReturnValue(mockConfig);
    mockGetAuthenticatedHttpClient.mockReturnValue(mockHttpClient as any);
  });

  describe('patchAccount', () => {
    const mockUsername = 'testuser123';
    const mockCommitValues = {
      gender: 'm',
      extended_profile: [
        { field_name: 'company', field_value: 'Test Company' },
        { field_name: 'level_of_education', field_value: 'Bachelor\'s Degree' }
      ]
    };
    const expectedUrl = `${mockConfig.LMS_BASE_URL}/api/user/v1/accounts/${mockUsername}`;
    const expectedConfig = {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    };

    it('should patch user account successfully', async () => {
      const mockResponse = { data: { success: true } };
      mockHttpClient.patch.mockResolvedValueOnce(mockResponse);

      await patchAccount(mockUsername, mockCommitValues);

      expect(mockGetAuthenticatedHttpClient).toHaveBeenCalled();
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        expectedUrl,
        mockCommitValues,
        expectedConfig
      );
    });


    it('should handle mixed profile and extended profile updates', async () => {
      const mixedCommitValues = {
        gender: 'o',
        year_of_birth: 1985,
        extended_profile: [
          { field_name: 'level_of_education', field_value: 'Master\'s Degree' }
        ]
      };
      const mockResponse = { data: { success: true } };
      mockHttpClient.patch.mockResolvedValueOnce(mockResponse);

      await patchAccount(mockUsername, mixedCommitValues);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        expectedUrl,
        mixedCommitValues,
        expectedConfig
      );
    });

    it('should handle empty commit values', async () => {
      const emptyCommitValues = {};
      const mockResponse = { data: { success: true } };
      mockHttpClient.patch.mockResolvedValueOnce(mockResponse);

      await patchAccount(mockUsername, emptyCommitValues);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        expectedUrl,
        emptyCommitValues,
        expectedConfig
      );
    });

    it('should construct correct URL with username', async () => {
      const differentUsername = 'anotheruser456';
      const mockResponse = { data: { success: true } };
      mockHttpClient.patch.mockResolvedValueOnce(mockResponse);

      await patchAccount(differentUsername, mockCommitValues);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `${mockConfig.LMS_BASE_URL}/api/user/v1/accounts/${differentUsername}`,
        mockCommitValues,
        expectedConfig
      );
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('API Error: Account update failed');
      mockHttpClient.patch.mockRejectedValueOnce(mockError);

      await expect(patchAccount(mockUsername, mockCommitValues)).rejects.toThrow('API Error: Account update failed');

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        expectedUrl,
        mockCommitValues,
        expectedConfig
      );
    });

    it('should handle HTTP 400 error', async () => {
      const mockError = {
        response: { 
          status: 400,
          data: { 
            field_errors: { 
              gender: 'Invalid gender value' 
            } 
          }
        },
        message: 'Bad Request'
      };
      mockHttpClient.patch.mockRejectedValueOnce(mockError);

      await expect(patchAccount(mockUsername, mockCommitValues)).rejects.toEqual(mockError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockHttpClient.patch.mockRejectedValueOnce(networkError);

      await expect(patchAccount(mockUsername, mockCommitValues)).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockHttpClient.patch.mockRejectedValueOnce(timeoutError);

      await expect(patchAccount(mockUsername, mockCommitValues)).rejects.toThrow('Request timeout');
    });

    it('should handle null or undefined username gracefully', async () => {
      const mockResponse = { data: { success: true } };
      mockHttpClient.patch.mockResolvedValueOnce(mockResponse);

      await patchAccount(null, mockCommitValues);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `${mockConfig.LMS_BASE_URL}/api/user/v1/accounts/null`,
        mockCommitValues,
        expectedConfig
      );
    });
  });
});