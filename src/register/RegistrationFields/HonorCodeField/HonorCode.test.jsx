import React from 'react';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';

import { HonorCode } from '../index';

const IntlHonorCode = injectIntl(HonorCode);

describe('HonorCodeTest', () => {
  mergeConfig({
    PRIVACY_POLICY: 'http://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'http://tos-and-honot-code.com',
  });
  // eslint-disable-next-line no-unused-vars
  let value = false;

  const changeHandler = (e) => {
    value = e.target.checked;
  };

  beforeEach(() => {
    value = false;
  });

  it('should render error msg if honor code is not checked', () => {
    const errorMessage = `You must agree to the ${getConfig().SITE_NAME} Honor Code`;
    const { container } = render(
      <IntlProvider locale="en">
        <IntlHonorCode
          errorMessage={errorMessage}
          onChangeHandler={changeHandler}
        />
      </IntlProvider>,
    );
    const errorElement = container.querySelector('.form-text-size'); // Adjust the selector as per your component

    expect(errorElement.textContent).toEqual(errorMessage);
  });

  it('should render Honor code field', () => {
    const expectedMsg = 'I agree to the Your Platform Name Here\u00a0Honor Codein a new tab';
    const { container } = render(
      <IntlProvider locale="en">
        <IntlHonorCode onChangeHandler={changeHandler} />
      </IntlProvider>,
    );

    const honorCodeField = container.querySelector('#honor-code');
    honorCodeField.dispatchEvent(new MouseEvent('change', { bubbles: true }));

    expect(honorCodeField.querySelector('label').textContent).toEqual(expectedMsg);
  });

  it('should render Terms of Service and Honor code field', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <IntlHonorCode fieldType="tos_and_honor_code" onChangeHandler={changeHandler} />
      </IntlProvider>,
    );
    const expectedMsg = 'By creating an account, you agree to the Terms of Service and Honor Code and you '
                        + 'acknowledge that Your Platform Name Here and each Member process your personal data in '
                        + 'accordance with the Privacy Policy.';
    const honorCodeField = container.querySelector('#honor-code');
    expect(honorCodeField.textContent).toEqual(expectedMsg);
  });
});
