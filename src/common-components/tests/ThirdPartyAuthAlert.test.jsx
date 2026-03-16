import { IntlProvider } from '@openedx/frontend-base';
import renderer from 'react-test-renderer';

import { registerPath } from '../../constants';
import { PENDING_STATE } from '../../data/constants';
import ThirdPartyAuthAlert from '../ThirdPartyAuthAlert';

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
      referrer: registerPath,
    };

    const tree = renderer.create(
      <IntlProvider locale="en">
        <ThirdPartyAuthAlert {...props} />
      </IntlProvider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders skeleton for pending third-party auth', () => {
    props = {
      ...props,
      thirdPartyAuthApiStatus: PENDING_STATE,
      isThirdPartyAuthActive: true,
    };

    const tree = renderer.create(
      <IntlProvider locale="en">
        <ThirdPartyAuthAlert {...props} />
      </IntlProvider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
