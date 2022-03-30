import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';

import LoginFailureMessage from '../LoginFailure';
import {
  FORBIDDEN_REQUEST,
  INACTIVE_USER,
  INTERNAL_SERVER_ERROR,
  INVALID_FORM,
  NON_COMPLIANT_PASSWORD_EXCEPTION,
  FAILED_LOGIN_ATTEMPT,
  INCORRECT_EMAIL_PASSWORD,
  NUDGE_PASSWORD_CHANGE,
  REQUIRE_PASSWORD_CHANGE,
} from '../data/constants';

const IntlLoginFailureMessage = injectIntl(LoginFailureMessage);

describe('LoginFailureMessage', () => {
  let props = {};

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
          supportLink: 'https://support.edx.org/',
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
    expect(loginFailureMessage.find('#login-failure-alert').find('a').props().href).toEqual('https://support.edx.org/');
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

  it('should match direct render of error message', () => {
    const errorMessage = 'Email or password is incorrect.';
    props = {
      loginError: {
        value: errorMessage,
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.'.concat(errorMessage);
    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
  });

  it('should match error message containing link snapshot', () => {
    props = {
      loginError: {
        value: 'To be on the safe side, you can reset your password <a href="/reset">here</a> before you try again.\n',
      },
    };

    const loginFailureMessage = mount(
      <IntlProvider locale="en">
        <IntlLoginFailureMessage {...props} />
      </IntlProvider>,
    );

    const expectedMessage = 'We couldn\'t sign you in.To be on the safe side, you can reset your password here before you try again.';

    expect(loginFailureMessage.find('#login-failure-alert').first().text()).toEqual(expectedMessage);
    expect(loginFailureMessage.find('#login-failure-alert').find('a').props().href).toEqual('/reset');
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
});
