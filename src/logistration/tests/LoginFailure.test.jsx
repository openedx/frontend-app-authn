import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import LoginFailureMessage from '../LoginFailure';
import { NON_COMPLIANT_PASSWORD_EXCEPTION } from '../data/constants';

describe('LoginFailureMessage', () => {
  let props = {};

  beforeEach(() => {
    props = {
      errors: 'Some error occurred logging you in.',
    };
  });

  it('should match non compliant password error message snapshot', () => {
    props = {
      ...props,
      errorCode: NON_COMPLIANT_PASSWORD_EXCEPTION,
    };

    const tree = renderer.create(
      <IntlProvider locale="en">
        <LoginFailureMessage {...props} />
      </IntlProvider>,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should match direct render of error message snapshot', () => {
    const tree = renderer.create(
      <IntlProvider locale="en">
        <LoginFailureMessage {...props} />
      </IntlProvider>,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
