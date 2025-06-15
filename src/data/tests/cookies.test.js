import Cookies from 'universal-cookie';

import { setCookie } from '../utils';

// Mock Cookies class
jest.mock('universal-cookie');

describe('setCookie function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set a cookie with default options', () => {
    setCookie('testCookie', 'testValue', 'example.com');

    expect(Cookies).toHaveBeenCalled();
    expect(Cookies).toHaveBeenCalledWith();
    expect(Cookies.prototype.set).toHaveBeenCalledWith('testCookie', 'testValue', {
      domain: 'example.com',
      path: '/',
    });
  });

  it('should set a cookie with specified expiry', () => {
    const expiry = new Date('2023-12-31');
    setCookie('testCookie', 'testValue', 'example.com', expiry);

    expect(Cookies).toHaveBeenCalled();
    expect(Cookies).toHaveBeenCalledWith();
    expect(Cookies.prototype.set).toHaveBeenCalledWith('testCookie', 'testValue', {
      domain: 'example.com',
      path: '/',
      expires: expiry,
    });
  });

  it('should not set a cookie if cookieName is undefined', () => {
    setCookie(undefined, 'testValue', 'example.com');

    expect(Cookies).not.toHaveBeenCalled();
  });
});
