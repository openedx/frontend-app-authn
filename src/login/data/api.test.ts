import { getConfig } from '@edx/frontend-platform';
import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import * as QueryString from 'query-string';

import { login } from './api';

// Mock the platform dependencies
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
  camelCaseObject: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('query-string', () => ({
  stringify: jest.fn(),
}));

const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>;
const mockCamelCaseObject = camelCaseObject as jest.MockedFunction<typeof camelCaseObject>;
const mockGetAuthenticatedHttpClient = getAuthenticatedHttpClient as jest.MockedFunction<typeof getAuthenticatedHttpClient>;
const mockQueryStringify = QueryString.stringify as jest.MockedFunction<typeof QueryString.stringify>;

describe('login api', () => {
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
    mockCamelCaseObject.mockImplementation((obj) => obj);
    mockQueryStringify.mockImplementation((obj) => `stringified=${JSON.stringify(obj)}`);
  });

  describe('login', () => {
    const mockCredentials = {
      email_or_username: 'testuser@example.com',
      password: 'password123',
    };
    const expectedUrl = `${mockConfig.LMS_BASE_URL}/api/user/v2/account/login_session/`;
    const expectedConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      isPublic: true,
    };

    it('should login successfully with redirect URL', async () => {
      const mockResponseData = {
        redirect_url: 'http://localhost:18000/courses',
        success: true,
      };
      const mockResponse = { data: mockResponseData };
      const expectedResult = {
        redirectUrl: 'http://localhost:18000/courses',
        success: true,
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);
      mockCamelCaseObject.mockReturnValueOnce(expectedResult);

      const result = await login(mockCredentials);

      expect(mockGetAuthenticatedHttpClient).toHaveBeenCalled();
      expect(mockQueryStringify).toHaveBeenCalledWith(mockCredentials);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `stringified=${JSON.stringify(mockCredentials)}`,
        expectedConfig
      );
      expect(mockCamelCaseObject).toHaveBeenCalledWith({
        redirectUrl: 'http://localhost:18000/courses',
        success: true,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle login failure with success false', async () => {
      const mockResponseData = {
        redirect_url: 'http://localhost:18000/login',
        success: false,
      };
      const mockResponse = { data: mockResponseData };
      const expectedResult = {
        redirectUrl: 'http://localhost:18000/login',
        success: false,
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);
      mockCamelCaseObject.mockReturnValueOnce(expectedResult);

      const result = await login(mockCredentials);

      expect(mockCamelCaseObject).toHaveBeenCalledWith({
        redirectUrl: 'http://localhost:18000/login',
        success: false,
      });
      expect(result).toEqual(expectedResult);
    });


    it('should properly stringify credentials using QueryString', async () => {
      const complexCredentials = {
        email_or_username: 'user@example.com',
        password: 'pass word!@#$',
        remember_me: true,
        next: '/courses/course-v1:edX+DemoX+Demo_Course/courseware',
      };
      const mockResponse = { data: { success: true } };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      await login(complexCredentials);

      expect(mockQueryStringify).toHaveBeenCalledWith(complexCredentials);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `stringified=${JSON.stringify(complexCredentials)}`,
        expectedConfig
      );
    });

    it('should use correct request configuration', async () => {
      const mockResponse = { data: { success: true } };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      await login(mockCredentials);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        expect.any(String),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          isPublic: true,
        }
      );
    });

    it('should handle API error during login', async () => {
      const mockError = new Error('Login API error');
      mockHttpClient.post.mockRejectedValueOnce(mockError);

      await expect(login(mockCredentials)).rejects.toThrow('Login API error');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `stringified=${JSON.stringify(mockCredentials)}`,
        expectedConfig
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockHttpClient.post.mockRejectedValueOnce(networkError);

      await expect(login(mockCredentials)).rejects.toThrow('Network Error');
    });

    it('should properly transform camelCase response', async () => {
      const mockResponseData = {
        redirect_url: 'http://localhost:18000/dashboard',
        success: true,
        user_id: 12345,
        extra_data: { some: 'value' },
      };
      const mockResponse = { data: mockResponseData };
      const expectedCamelCaseInput = {
        redirectUrl: 'http://localhost:18000/dashboard',
        success: true,
      };
      const expectedResult = {
        redirectUrl: 'http://localhost:18000/dashboard',
        success: true,
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);
      mockCamelCaseObject.mockReturnValueOnce(expectedResult);

      const result = await login(mockCredentials);

      expect(mockCamelCaseObject).toHaveBeenCalledWith(expectedCamelCaseInput);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty credentials object', async () => {
      const emptyCredentials = {};
      const mockResponse = { data: { success: false } };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      await login(emptyCredentials);

      expect(mockQueryStringify).toHaveBeenCalledWith(emptyCredentials);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        `stringified=${JSON.stringify(emptyCredentials)}`,
        expectedConfig
      );
    });
  });
});