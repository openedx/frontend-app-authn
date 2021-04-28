import React from 'react';
import { mount } from 'enzyme';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';

import LoginFailureMessage from '../LoginFailure';
import {
  FORBIDDEN_REQUEST,
  INACTIVE_USER,
  INTERNAL_SERVER_ERROR,
  INVALID_FORM,
  NON_COMPLIANT_PASSWORD_EXCEPTION,
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

    const expectedMessage = 'We couldn\'t sign you in.We recently changed our password requirements '
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
});
