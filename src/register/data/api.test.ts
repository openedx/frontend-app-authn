import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import * as QueryString from 'query-string';

import { getFieldsValidations, registerNewUserApi } from './api';

// Mock the platform modules
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
  getHttpClient: jest.fn(),
}));

jest.mock('query-string', () => ({
  stringify: jest.fn(),
}));

describe('API Functions', () => {
  let mockAuthenticatedHttpClient: any;
  let mockHttpClient: any;
  let mockGetConfig: any;
  let mockStringify: any;

  beforeEach(() => {
    mockAuthenticatedHttpClient = {
      post: jest.fn(),
    };
    mockHttpClient = {
      post: jest.fn(),
    };
    mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;
    mockStringify = QueryString.stringify as jest.MockedFunction<typeof QueryString.stringify>;

    (getAuthenticatedHttpClient as jest.MockedFunction<typeof getAuthenticatedHttpClient>)
      .mockReturnValue(mockAuthenticatedHttpClient);
    (getHttpClient as jest.MockedFunction<typeof getHttpClient>)
      .mockReturnValue(mockHttpClient);

    mockGetConfig.mockReturnValue({
      LMS_BASE_URL: 'http://localhost:18000',
    });

    mockStringify.mockImplementation((obj) => Object.keys(obj).map(key => `${key}=${obj[key]}`).join('&'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerNewUserApi', () => {
    const mockRegistrationInfo = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword',
      name: 'Test User',
    };

    it('should successfully register a new user and return formatted response', async () => {
      const mockApiResponse = {
        data: {
          redirect_url: '/dashboard/custom',
          success: true,
          authenticated_user: {
            username: 'testuser',
            email: 'test@example.com',
          },
        },
      };

      mockAuthenticatedHttpClient.post.mockResolvedValue(mockApiResponse);

      const result = await registerNewUserApi(mockRegistrationInfo);

      expect(mockAuthenticatedHttpClient.post).toHaveBeenCalledWith(
        'http://localhost:18000/api/user/v2/account/registration/',
        'username=testuser&email=test@example.com&password=testpassword&name=Test User',
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          isPublic: true,
        }
      );

      expect(mockStringify).toHaveBeenCalledWith(mockRegistrationInfo);

      expect(result).toEqual({
        redirectUrl: '/dashboard/custom',
        success: true,
        authenticatedUser: {
          username: 'testuser',
          email: 'test@example.com',
        },
      });
    });

    it('should use default values when API response is missing optional fields', async () => {
      const mockApiResponse = {
        data: {},
      };

      mockAuthenticatedHttpClient.post.mockResolvedValue(mockApiResponse);

      const result = await registerNewUserApi(mockRegistrationInfo);

      expect(result).toEqual({
        redirectUrl: 'http://localhost:18000/dashboard',
        success: false,
        authenticatedUser: undefined,
      });
    });

    it('should throw error when registration API call fails', async () => {
      const mockError = new Error('Registration failed');
      mockAuthenticatedHttpClient.post.mockRejectedValue(mockError);

      await expect(registerNewUserApi(mockRegistrationInfo)).rejects.toThrow('Registration failed');
    });

    it('should handle network errors and throw them', async () => {
      const networkError = {
        response: {
          status: 400,
          data: { field_errors: { email: ['Email already exists'] } },
        },
      };
      mockAuthenticatedHttpClient.post.mockRejectedValue(networkError);

      await expect(registerNewUserApi(mockRegistrationInfo)).rejects.toEqual(networkError);
    });
  });

  describe('getFieldsValidations', () => {
    const mockFormPayload = {
      username: 'testuser',
      email: 'test@example.com',
    };

    it('should successfully get field validations and return formatted response', async () => {
      const mockApiResponse = {
        data: {
          username: ['Username is available'],
          email: ['Email is valid'],
          validation_decisions: {
            username: '',
            email: '',
          },
        },
      };

      mockHttpClient.post.mockResolvedValue(mockApiResponse);

      const result = await getFieldsValidations(mockFormPayload);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'http://localhost:18000/api/user/v1/validation/registration',
        'username=testuser&email=test@example.com',
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      expect(mockStringify).toHaveBeenCalledWith(mockFormPayload);

      expect(result).toEqual({
        fieldValidations: {
          username: ['Username is available'],
          email: ['Email is valid'],
          validation_decisions: {
            username: '',
            email: '',
          },
        },
      });
    });

    it('should throw error when validation API call fails', async () => {
      const mockError = new Error('Validation failed');
      mockHttpClient.post.mockRejectedValue(mockError);

      await expect(getFieldsValidations(mockFormPayload)).rejects.toThrow('Validation failed');
    });

    it('should handle validation errors with field-specific messages', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            username: ['Username already taken'],
            email: ['Invalid email format'],
          },
        },
      };
      mockHttpClient.post.mockRejectedValue(validationError);

      await expect(getFieldsValidations(mockFormPayload)).rejects.toEqual(validationError);
    });

    it('should handle empty validation response', async () => {
      const mockApiResponse = {
        data: {},
      };

      mockHttpClient.post.mockResolvedValue(mockApiResponse);

      const result = await getFieldsValidations(mockFormPayload);

      expect(result).toEqual({
        fieldValidations: {},
      });
    });

    it('should handle network connectivity errors', async () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
      };
      mockHttpClient.post.mockRejectedValue(networkError);

      await expect(getFieldsValidations(mockFormPayload)).rejects.toEqual(networkError);
    });
  });
});
