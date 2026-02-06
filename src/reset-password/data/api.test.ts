import { getConfig } from '@edx/frontend-platform';
import { getHttpClient } from '@edx/frontend-platform/auth';
import formurlencoded from 'form-urlencoded';

import { validateToken, resetPassword, validatePassword } from './api';

// Mock the platform dependencies
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getHttpClient: jest.fn(),
}));

jest.mock('form-urlencoded', () => jest.fn());

const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;
const mockGetHttpClient = getHttpClient as jest.MockedFunction<typeof getHttpClient>;
const mockFormurlencoded = formurlencoded as jest.MockedFunction<typeof formurlencoded>;

describe('reset-password api', () => {
  const mockHttpClient = {
    post: jest.fn(),
  };

  const mockConfig = {
    LMS_BASE_URL: 'http://localhost:18000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig.mockReturnValue(mockConfig);
    mockGetHttpClient.mockReturnValue(mockHttpClient as any);
    mockFormurlencoded.mockImplementation((data) => `encoded=${JSON.stringify(data)}`);
  });

  describe('validateToken', () => {
    const mockToken = 'test-token-123';
    const expectedUrl = `${mockConfig.LMS_BASE_URL}/user_api/v1/account/password_reset/token/validate/`;
    const expectedConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    it('should validate token successfully', async () => {
      const mockResponse = { data: { is_valid: true, message: 'Token is valid' } };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await validateToken(mockToken);

      expect(mockGetHttpClient).toHaveBeenCalled();
      expect(mockFormurlencoded).toHaveBeenCalledWith({ token: mockToken });
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify({ token: mockToken })}`,
        expectedConfig
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error during token validation', async () => {
      const mockError = new Error('Network error');
      mockHttpClient.post.mockRejectedValueOnce(mockError);

      await expect(validateToken(mockToken)).rejects.toThrow('Network error');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify({ token: mockToken })}`,
        expectedConfig
      );
    });

    it('should handle invalid token response', async () => {
      const mockResponse = { data: { is_valid: false, message: 'Token is invalid' } };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await validateToken(mockToken);

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify({ token: mockToken })}`,
        expectedConfig
      );
    });
  });

  describe('resetPassword', () => {
    const mockToken = 'reset-token-123';
    const mockPayload = {
      new_password1: 'newpassword123',
      new_password2: 'newpassword123',
    };
    const expectedConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    it('should reset password successfully without account recovery', async () => {
      const mockQueryParams = { is_account_recovery: false };
      const mockResponse = { data: { reset_status: true, message: 'Password reset successful' } };
      const expectedUrl = `${mockConfig.LMS_BASE_URL}/password/reset/${mockToken}/`;
      
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await resetPassword(mockPayload, mockToken, mockQueryParams);

      expect(mockGetHttpClient).toHaveBeenCalled();
      expect(mockFormurlencoded).toHaveBeenCalledWith(mockPayload);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify(mockPayload)}`,
        expectedConfig
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should reset password with account recovery parameter', async () => {
      const mockQueryParams = { is_account_recovery: true };
      const mockResponse = { data: { reset_status: true, message: 'Password reset successful' } };
      const expectedUrl = `${mockConfig.LMS_BASE_URL}/password/reset/${mockToken}/?is_account_recovery=true`;
      
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await resetPassword(mockPayload, mockToken, mockQueryParams);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify(mockPayload)}`,
        expectedConfig
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle password reset failure', async () => {
      const mockQueryParams = { is_account_recovery: false };
      const mockResponse = { 
        data: { 
          reset_status: false, 
          err_msg: ['Password is too weak'], 
          token_invalid: false 
        } 
      };
      const expectedUrl = `${mockConfig.LMS_BASE_URL}/password/reset/${mockToken}/`;
      
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await resetPassword(mockPayload, mockToken, mockQueryParams);

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error during password reset', async () => {
      const mockQueryParams = { is_account_recovery: false };
      const mockError = new Error('Server error');
      mockHttpClient.post.mockRejectedValueOnce(mockError);

      await expect(resetPassword(mockPayload, mockToken, mockQueryParams)).rejects.toThrow('Server error');
    });

    it('should handle missing query parameters', async () => {
      const mockQueryParams = {};
      const mockResponse = { data: { reset_status: true } };
      const expectedUrl = `${mockConfig.LMS_BASE_URL}/password/reset/${mockToken}/`;
      
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await resetPassword(mockPayload, mockToken, mockQueryParams);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify(mockPayload)}`,
        expectedConfig
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('validatePassword', () => {
    const mockPayload = {
      password: 'testpassword123',
    };
    const expectedUrl = `${mockConfig.LMS_BASE_URL}/api/user/v1/validation/registration`;
    const expectedConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    it('should validate password successfully with no errors', async () => {
      const mockResponse = {
        data: {
          validation_decisions: {
            password: '',
          },
        },
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await validatePassword(mockPayload);

      expect(mockGetHttpClient).toHaveBeenCalled();
      expect(mockFormurlencoded).toHaveBeenCalledWith(mockPayload);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify(mockPayload)}`,
        expectedConfig
      );
      expect(result).toBe('');
    });

    it('should return password validation error message', async () => {
      const errorMessage = 'Password is too weak';
      const mockResponse = {
        data: {
          validation_decisions: {
            password: errorMessage,
          },
        },
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await validatePassword(mockPayload);

      expect(result).toBe(errorMessage);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify(mockPayload)}`,
        expectedConfig
      );
    });

    it('should handle missing validation_decisions in response', async () => {
      const mockResponse = {
        data: {
          // No validation_decisions field
        },
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await validatePassword(mockPayload);

      expect(result).toBe('');
    });

    it('should handle API error during password validation', async () => {
      const mockError = new Error('Validation service unavailable');
      mockHttpClient.post.mockRejectedValueOnce(mockError);

      await expect(validatePassword(mockPayload)).rejects.toThrow('Validation service unavailable');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `encoded=${JSON.stringify(mockPayload)}`,
        expectedConfig
      );
    });
  });
});
