import React from 'react';

import { mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';

import HonorCode from '../registrationFields/HonorCode';

const IntlHonorCode = injectIntl(HonorCode);

describe('HonorCodeTest', () => {
  mergeConfig({
    PRIVACY_POLICY: 'http://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'http://tos-and-honot-code.com',
  });
  let value = false;

  const changeHandler = (e) => {
    value = e.target.checked;
  };

  beforeEach(() => {
    value = false;
  });

  it('should render error msg if honor code is not checked', () => {
    const honorCode = mount(
      <IntlProvider locale="en">
        <IntlHonorCode errorMessage="You must agree to the edx Honor Code" onChangeHandler={changeHandler} />
      </IntlProvider>,
    );
    expect(honorCode.find('.form-text-size').last().text()).toEqual('You must agree to the edx Honor Code');
  });

  it('should render Honor code field', () => {
    const expectedMsg = 'I agree to the Your Platform Name Here Honor Codein a new tab';
    const honorCode = mount(
      <IntlProvider locale="en">
        <IntlHonorCode onChangeHandler={changeHandler} />
      </IntlProvider>,
    );

    honorCode.find('#honor-code').last().simulate('change', { target: { checked: true, type: 'checkbox' } });
    expect(honorCode.find('#honor-code').find('label').text()).toEqual(expectedMsg);
    expect(value).toEqual(true);
  });

  it('should render Terms of Service and Honor code field', () => {
    const HonorCodeProps = mount(
      <IntlProvider locale="en">
        <IntlHonorCode fieldType="tos_and_honor_code" onChangeHandler={changeHandler} />
      </IntlProvider>,
    );
    const expectedMsg = 'By creating an account, you agree to the Terms of Service and Honor Codein a new tab and you '
                        + 'acknowledge that Your Platform Name Here and each Member process your personal data in '
                        + 'accordance with the Privacy Policyin a new tab.';
    const field = HonorCodeProps.find('#honor-code');
    expect(field.text()).toEqual(expectedMsg);
  });
});
