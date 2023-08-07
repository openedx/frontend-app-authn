import React from 'react';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import {
  ALLOWED_DOMAIN_LOGIN_ERROR,
  FAILED_LOGIN_ATTEMPT,
  FORBIDDEN_REQUEST,
  INACTIVE_USER,
  INCORRECT_EMAIL_PASSWORD,
  INTERNAL_SERVER_ERROR,
  INVALID_FORM,
  NON_COMPLIANT_PASSWORD_EXCEPTION,
  NUDGE_PASSWORD_CHANGE,
  REQUIRE_PASSWORD_CHANGE,
  TPA_AUTHENTICATION_FAILURE,
} from '../data/constants';
import LoginFailureMessage from '../LoginFailure';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthService: jest.fn(),
}));

const IntlLoginFailureMessage = injectIntl(LoginFailureMessage);

describe('LoginFailureMessage', () => {
  let props = {};

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query,
      })),
    });
  });

  it('should match non compliant password error message', () => {
    props = {
      loginError: {
        errorCode: NON_COMPLIANT_PASSWORD_EXCEPTION,
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.We recently changed our password requirements'
                            + 'Your current password does not meet the new security requirements. We just sent a '
                            + 'password-reset message to the email address associated with this account. '
                            + 'Thank you for helping us keep your data safe.';

    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('should match inactive user error message', () => {
    props = {
      loginError: {
        email: 'text@example.com',
        errorCode: INACTIVE_USER,
        context: {
          platformName: 'openedX',
          supportLink: 'http://support.openedx.test',
        },
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.In order to sign in, you need to activate your account. '
                            + 'We just sent an activation link to text@example.com. If you do not receive an email, '
                            + 'check your spam folders or contact openedX support.';

    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
    expect(loginFailureMessage.find('#login-failure-alert').find('a').props().href).toEqual('http://support.openedx.test');
  });

  it('test match failed login attempt error', () => {
    props = {
      loginError: {
        email: 'text@example.com',
        errorCode: FAILED_LOGIN_ATTEMPT,
        context: {
          remainingAttempts: 3,
          allowedFailureAttempts: 6,
          resetLink: '/reset',
        },
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );
    const expectedMessage = 'We couldn\'t sign you in.The username, email or password you entered is incorrect. '
                            + 'You have 3 more sign in attempts before your account is temporarily locked.If you\'ve forgotten your password, click here to reset it.';

    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('test match failed login error first attempt', () => {
    props = {
      loginError: {
        email: 'text@example.com',
        errorCode: INCORRECT_EMAIL_PASSWORD,
        context: {
          failureCount: 1,
          resetLink: '/reset',
        },
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );
    const expectedMessage = 'We couldn\'t sign you in.The username, email, or password you entered is incorrect. Please try again.';

    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('test match failed login error second attempt', () => {
    props = {
      loginError: {
        email: 'text@example.com',
        errorCode: INCORRECT_EMAIL_PASSWORD,
        context: {
          failureCount: 2,
          resetLink: '/reset',
        },
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );
    const expectedMessage = 'We couldn\'t sign you in.The username, email, or password you entered is incorrect. Please try again or reset your password.';

    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('should match rate limit error message', () => {
    props = {
      loginError: {
        errorCode: FORBIDDEN_REQUEST,
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.Too many failed login attempts. Try again later.';
    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('should match internal server error message', () => {
    props = {
      loginError: {
        errorCode: INTERNAL_SERVER_ERROR,
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.An error has occurred. Try refreshing the page, or check your internet connection.';
    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('should match invalid form error message', () => {
    props = {
      loginError: {
        errorCode: INVALID_FORM,
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.Please fill in the fields below.';
    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('should match internal server of error message', () => {
    props = {
      loginError: {
        errorCode: 'invalid-error-code',
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.An error has occurred. Try refreshing the page, or check your internet connection.';
    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('should match tpa authentication failed error message', () => {
    props = {
      loginError: {
        errorCode: TPA_AUTHENTICATION_FAILURE,
        context: {
          errorMessage: 'An error occurred',
        },
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessageSubstring = 'We are sorry, you are not authorized to access';

    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toContain(expectedMessageSubstring);
    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toContain('An error occurred');
  });

  it('should show modal that nudges users to change password', () => {
    props = {
      loginError: {
        errorCode: NUDGE_PASSWORD_CHANGE,
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <MemoryRouter>
          <IntlLoginFailureMessage {...props} />
        </MemoryRouter>
      </IntlProvider>,
    );

    expect(loginFailureMessage.find('.pgn__modal-title').text()).toEqual('Password security');
    expect(loginFailureMessage.find('.pgn__modal-body').text()).toEqual(
      'Our system detected that your password is vulnerable. '
               + 'We recommend you change it so that your account stays secure.',
    );
  });

  it('should show modal that requires users to change password', () => {
    props = {
      loginError: {
        errorCode: REQUIRE_PASSWORD_CHANGE,
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <MemoryRouter>
          <IntlLoginFailureMessage {...props} />
        </MemoryRouter>
      </IntlProvider>,
    );

    expect(loginFailureMessage.find('.pgn__modal-title').text()).toEqual('Password change required');
    expect(loginFailureMessage.find('.pgn__modal-body').text()).toEqual(
      'Our system detected that your password is vulnerable. '
               + 'Change your password so that your account stays secure.',
    );
  });

  it('should show message if staff user try to login through password', () => {
    props = {
      loginError: {
        email: 'text@example.com',
        errorCode: ALLOWED_DOMAIN_LOGIN_ERROR,
        context: {
          allowedDomain: 'test.com',
          provider: 'Google',
          tpaHint: 'google-auth2',
        },
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const errorMessage = "We couldn't sign you in.As test.com user, You must login with your test.com Google account.";
    const url = 'http://localhost:18000/dashboard/?tpa_hint=google-auth2';

    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(errorMessage);
    expect(loginFailureMessage.find('#login-failure-alert').find('a').props().href).toEqual(url);
  });
});
