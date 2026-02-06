import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import formurlencoded from 'form-urlencoded';

import { forgotPassword } from './api';

// Mock the platform dependencies
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('form-urlencoded', () => jest.fn());

const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;
const mockGetAuthenticatedHttpClient = getAuthenticatedHttpClient as jest.MockedFunction<typeof getAuthenticatedHttpClient>;
const mockFormurlencoded = formurlencoded as jest.MockedFunction<typeof formurlencoded>;

describe('forgot-password api', () => {
  const mockHttpClient = {
    post: jest.fn(),
  };

  const mockConfig = {
    LMS_BASE_URL: 'http://localhost:18000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig.mockReturnValue(mockConfig);
    mockGetAuthenticatedHttpClient.mockReturnValue(mockHttpClient as any);
    mockFormurlencoded.mockImplementation((data) => `encoded=${JSON.stringify(data)}`);
  });

  describe('forgotPassword', () => {
    const testEmail = 'test@example.com';
    const expectedUrl = `${mockConfig.LMS_BASE_URL}/account/password`;
    const expectedConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      isPublic: true,
    };

    it('should send forgot password request successfully', async () => {
      const mockResponse = { 
        data: { 
          message: 'Password reset email sent successfully',
          success: true 
        } 
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await forgotPassword(testEmail);

      expect(mockGetAuthenticatedHttpClient).toHaveBeenCalled();
      expect(mockFormurlencoded).toHaveBeenCalledWith({ email: testEmail });
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify({ email: testEmail })}`,
        expectedConfig
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty email address', async () => {
      const emptyEmail = '';
      const mockResponse = { 
        data: { 
          message: 'Email is required',
          success: false 
        } 
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await forgotPassword(emptyEmail);

      expect(mockFormurlencoded).toHaveBeenCalledWith({ email: emptyEmail });
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify({ email: emptyEmail })}`,
        expectedConfig
      );
      expect(result).toEqual(mockResponse.data);
    });


    it('should handle network errors without response', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockHttpClient.post.mockRejectedValueOnce(networkError);

      await expect(forgotPassword(testEmail)).rejects.toThrow('Network Error');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        expect.any(String),
        expectedConfig
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockHttpClient.post.mockRejectedValueOnce(timeoutError);

      await expect(forgotPassword(testEmail)).rejects.toThrow('Request timeout');
    });

    it('should handle response with no data field', async () => {
      const mockResponse = { 
        // No data field
        status: 200,
        statusText: 'OK'
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await forgotPassword(testEmail);

      expect(result).toBeUndefined();
    });

    it('should return exactly the data field from response', async () => {
      const expectedData = {
        message: 'Password reset email sent successfully',
        success: true,
        timestamp: '2026-02-05T10:00:00Z'
      };
      const mockResponse = { 
        data: expectedData,
        status: 200,
        headers: {}
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await forgotPassword(testEmail);

      expect(result).toEqual(expectedData);
      expect(result).not.toHaveProperty('status');
      expect(result).not.toHaveProperty('headers');
    });
  });
});