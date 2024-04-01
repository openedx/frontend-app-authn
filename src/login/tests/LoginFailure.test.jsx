import React from 'react';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render, screen,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
  ACCOUNT_LOCKED_OUT,
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
      errorCode: NON_COMPLIANT_PASSWORD_EXCEPTION,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.We recently changed our password requirements'
                            + 'Your current password does not meet the new security requirements. We just sent a '
                            + 'password-reset message to the email address associated with this account. '
                            + 'Thank you for helping us keep your data safe.';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match inactive user error message', () => {
    props = {
      context: {
        email: 'text@example.com',
        platformName: 'openedX',
        supportLink: 'http://support.openedx.test',
      },
      errorCode: INACTIVE_USER,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.In order to sign in, you need to activate your account. '
                            + 'We just sent an activation link to text@example.com. If you do not receive an email, '
                            + 'check your spam folders or contact openedX support.';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);

    expect(screen.getByRole('link', { name: 'contact openedX support' }).getAttribute('href')).toBe('http://support.openedx.test');
  });

  it('test match failed login attempt error', () => {
    props = {
      context: {
        email: 'text@example.com',
        remainingAttempts: 3,
        allowedFailureAttempts: 6,
        resetLink: '/reset',
      },
      errorCode: FAILED_LOGIN_ATTEMPT,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.The username, email or password you entered is incorrect. '
                            + 'You have 3 more sign in attempts before your account is temporarily locked.If you\'ve forgotten your password, click here to reset it.';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('test match failed login error first attempt', () => {
    props = {
      context: {
        email: 'text@example.com',
        failureCount: 1,
        resetLink: '/reset',
      },
      errorCode: INCORRECT_EMAIL_PASSWORD,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.The username, email, or password you entered is incorrect. Please try again.';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('test match user account locked out', () => {
    props = {
      errorCode: ACCOUNT_LOCKED_OUT,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.To protect your account, it\'s been temporarily locked. Try again in 30 minutes.To be on the safe side, you can reset your password before trying again.';
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('test match failed login error second attempt', () => {
    props = {
      context: {
        email: 'text@example.com',
        failureCount: 2,
        resetLink: '/reset',
      },
      errorCode: INCORRECT_EMAIL_PASSWORD,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.The username, email, or password you entered is incorrect. Please try again or reset your password.';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match rate limit error message', () => {
    props = {
      errorCode: FORBIDDEN_REQUEST,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.Too many failed login attempts. Try again later.';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match internal server error message', () => {
    props = {
      errorCode: INTERNAL_SERVER_ERROR,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.An error has occurred. Try refreshing the page, or check your internet connection.';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match invalid form error message', () => {
    props = {
      errorCode: INVALID_FORM,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.Please fill in the fields below.';
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match internal server of error message', () => {
    props = {
      errorCode: 'invalid-error-code',
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.An error has occurred. Try refreshing the page, or check your internet connection.';
    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match tpa authentication failed error message', () => {
    props = {
      errorCode: TPA_AUTHENTICATION_FAILURE,
      errorCount: 0,
      context: { errorMessage: 'An error occurred' },
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessageSubstring = 'We are sorry, you are not authorized to access';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toContain(expectedMessageSubstring);

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toContain('An error occurred');
  });

  it('should show modal that nudges users to change password', () => {
    props = {
      errorCode: NUDGE_PASSWORD_CHANGE,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <MemoryRouter>
          <IntlLoginFailureMessage {...props} />
        </MemoryRouter>
      </IntlProvider>,
    );

    const message = 'Our system detected that your password is vulnerable. '
                         + 'We recommend you change it so that your account stays secure.';
    expect(screen.getByText(
      'Password security',
      { selector: '.pgn__modal-title' },
    ).textContent).toEqual('Password security');
    expect(screen.getByText(
      '',
      { selector: '.pgn__modal-body' },
    ).textContent).toEqual(message);
  });

  it('should show modal that requires users to change password', () => {
    props = {
      errorCode: REQUIRE_PASSWORD_CHANGE,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <MemoryRouter>
          <IntlLoginFailureMessage {...props} />
        </MemoryRouter>
      </IntlProvider>,
    );

    expect(screen.getByText(
      'Password change required',
      { selector: '.pgn__modal-title' },
    ).textContent).toEqual('Password change required');
    expect(screen.getByText(
      '',
      { selector: '.pgn__modal-body' },
    ).textContent).toEqual(
      'Our system detected that your password is vulnerable. '
               + 'Change your password so that your account stays secure.',
    );
  });

  it('should show message if staff user try to login through password', () => {
    props = {
      context: {
        email: 'text@example.com',
        allowedDomain: 'test.com',
        provider: 'Google',
        tpaHint: 'google-auth2',
      },
      errorCode: ALLOWED_DOMAIN_LOGIN_ERROR,
      errorCount: 0,
    };

    render(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const errorMessage = "We couldn't sign you in.As test.com user, You must login with your test.com Google account.";
    const url = 'http://localhost:18000/dashboard/?tpa_hint=google-auth2';

    expect(screen.getByText(
      '',
      { selector: '#login-failure-alert' },
    ).textContent).toContain(errorMessage);

    expect(screen.getByRole('link', { name: 'Google account' }).getAttribute('href')).toBe(url);
  });
});
