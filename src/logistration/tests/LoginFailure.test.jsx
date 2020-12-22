import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import LoginFailureMessage from '../LoginFailure';
import { INACTIVE_USER, NON_COMPLIANT_PASSWORD_EXCEPTION } from '../data/constants';

describe('LoginFailureMessage', () => {
  let props = {};

  it('should match non compliant password error message snapshot', () => {
    props = {
      loginError: {
        errorCode: NON_COMPLIANT_PASSWORD_EXCEPTION,
      },
    };

    const tree = renderer.create(
      <IntlProvider locale="en">
        <LoginFailureMessage {...props} />
      </IntlProvider>,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should match inactive user error message snapshot', () => {
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

    const tree = renderer.create(
      <IntlProvider locale="en">
        <LoginFailureMessage {...props} />
      </IntlProvider>,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should match direct render of error message snapshot', () => {
    props = {
      loginError: {
        value: 'Email or password is incorrect.',
      },
    };

    const tree = renderer.create(
      <IntlProvider locale="en">
        <LoginFailureMessage {...props} />
      </IntlProvider>,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should match error message containing link snapshot', () => {
    props = {
      loginError: {
        value: 'To be on the safe side, you can reset your password <a href="/reset">here</a> before you try again.\n',
      },
    };

    const tree = renderer.create(
      <IntlProvider locale="en">
        <LoginFailureMessage {...props} />
      </IntlProvider>,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
