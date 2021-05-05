import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ThirdPartyAuthAlert from '../ThirdPartyAuthAlert';
import { REGISTER_PAGE } from '../../data/constants';

describe('ThirdPartyAuthAlert', () => {
  let props = {};

  beforeEach(() => {
    props = {
      currentProvider: 'Google',
      platformName: 'edX',
    };
  });

  it('should match login page third party auth alert message snapshot', () => {
    const tree = renderer.create(
      <IntlProvider locale="en">
        <ThirdPartyAuthAlert {...props} />
      </IntlProvider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match register page third party auth alert message snapshot', () => {
    props = {
      ...props,
      referrer: REGISTER_PAGE,
    };

    const tree = renderer.create(
      <IntlProvider locale="en">
        <ThirdPartyAuthAlert {...props} />
      </IntlProvider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
