import {
  CurrentAppProvider, getSiteConfig, injectIntl, IntlProvider, mergeAppConfig
} from '@openedx/frontend-base';
import { render } from '@testing-library/react';

import { testAppId } from '../../../setupTest';
import { HonorCode } from '../index';

const IntlHonorCode = injectIntl(HonorCode);

const providerWrapper = children => (
  <IntlProvider locale="en">
    <CurrentAppProvider appId={testAppId}>
      {children}
    </CurrentAppProvider>
  </IntlProvider>
);

describe('HonorCodeTest', () => {
  mergeAppConfig(testAppId, {
    PRIVACY_POLICY: 'http://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'http://tos-and-honot-code.com',
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let value = false;

  const changeHandler = (e) => {
    value = e.target.checked;
  };

  beforeEach(() => {
    value = false;
  });

  it('should render error msg if honor code is not checked', () => {
    const errorMessage = `You must agree to the ${getSiteConfig().siteName} Honor Code`;
    const { container } = render(providerWrapper(
      <IntlHonorCode
        errorMessage={errorMessage}
        onChangeHandler={changeHandler}
      />
    ));
    const errorElement = container.querySelector('.form-text-size'); // Adjust the selector as per your component

    expect(errorElement.textContent).toEqual(errorMessage);
  });

  it('should render Honor code field', () => {
    const expectedMsg = `I agree to the ${getSiteConfig().siteName}\u00a0Honor Codein a new tab`;
    const { container } = render(providerWrapper(
      <IntlHonorCode onChangeHandler={changeHandler} />
    ));

    const honorCodeField = container.querySelector('#honor-code');
    honorCodeField.dispatchEvent(new MouseEvent('change', { bubbles: true }));

    expect(honorCodeField.querySelector('label').textContent).toEqual(expectedMsg);
  });

  it('should render Terms of Service and Honor code field', () => {
    const { container } = render(providerWrapper(
      <IntlHonorCode fieldType="tos_and_honor_code" onChangeHandler={changeHandler} />
    ));
    const expectedMsg = 'By creating an account, you agree to the Terms of Service and Honor Code and you '
      + `acknowledge that ${getSiteConfig().siteName} and each Member process your personal data in `
      + 'accordance with the Privacy Policy.';
    const honorCodeField = container.querySelector('#honor-code');
    expect(honorCodeField.textContent).toEqual(expectedMsg);
  });
});
