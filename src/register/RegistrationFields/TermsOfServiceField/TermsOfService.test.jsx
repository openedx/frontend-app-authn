import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';

import { TermsOfService } from '../index';

const IntlTermsOfService = injectIntl(TermsOfService);

describe('TermsOfServiceTest', () => {
  let value = false;

  const changeHandler = (e) => {
    value = e.target.checked;
  };

  beforeEach(() => {
    value = false;
  });

  it('should render error msg if Terms of Service checkbox is not checked', () => {
    const errorMessage = `You must agree to the ${getConfig().SITE_NAME} Terms of Service`;
    const termsOfService = mount(
      <IntlProvider locale="en">
        <IntlTermsOfService errorMessage={errorMessage} onChangeHandler={changeHandler} />
      </IntlProvider>,
    );
    expect(termsOfService.find('.form-text-size').last().text()).toEqual(errorMessage);
  });

  it('should render Terms of Service field', () => {
    const termsOfService = mount(
      <IntlProvider locale="en">
        <IntlTermsOfService onChangeHandler={changeHandler} />
      </IntlProvider>,
    );
    const expectedMsg = 'I agree to the Your Platform Name Here\u00a0Terms of Servicein a new tab';
    expect(termsOfService.find('#terms-of-service').find('label').text()).toEqual(expectedMsg);
    expect(value).toEqual(false);
  });

  it('should change value when Terms of Service field is checked', () => {
    const termsOfService = mount(
      <IntlProvider locale="en">
        <IntlTermsOfService onChangeHandler={changeHandler} />
      </IntlProvider>,
    );
    const field = termsOfService.find('input#tos');
    field.simulate('change', { target: { checked: true, type: 'checkbox' } });
    expect(value).toEqual(true);
  });
});
