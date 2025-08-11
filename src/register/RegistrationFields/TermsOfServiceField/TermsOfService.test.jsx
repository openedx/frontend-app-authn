import { getConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render } from '@testing-library/react';

import { TermsOfService } from '../index';

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
    const { container } = render(
      <IntlProvider locale="en">
        <TermsOfService errorMessage={errorMessage} onChangeHandler={changeHandler} />
      </IntlProvider>,
    );
    const errorElement = container.querySelector('.form-text-size');
    expect(errorElement.textContent).toEqual(errorMessage);
  });

  it('should render Terms of Service field', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <TermsOfService onChangeHandler={changeHandler} />
      </IntlProvider>,
    );

    const expectedMsg = 'I agree to the Your Platform Name Here\u00a0Terms of Servicein a new tab';

    const termsOfServiceLabel = container.querySelector('#terms-of-service label');
    expect(termsOfServiceLabel.textContent).toEqual(expectedMsg);

    expect(value).toEqual(false);
  });

  it('should change value when Terms of Service field is checked', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <TermsOfService onChangeHandler={changeHandler} />
      </IntlProvider>,
    );
    const field = container.querySelector('input#tos');
    fireEvent.click(field);
    expect(value).toEqual(true);
  });
});
