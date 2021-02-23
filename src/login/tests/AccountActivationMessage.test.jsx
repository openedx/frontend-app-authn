import React from 'react';
import { mount } from 'enzyme';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';

import AccountActivationMessage from '../AccountActivationMessage';
import { ACCOUNT_ACTIVATION_MESSAGE } from '../data/constants';

const IntlAccountActivationMessage = injectIntl(AccountActivationMessage);

describe('AccountActivationMessage', () => {
  it('should match account already activated message', () => {
    const accountActivationMessage = mount(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.INFO} />
      </IntlProvider>,
    );

    const expectedMessage = 'This account has already been activated.';
    expect(accountActivationMessage.find('#account-activation-message').find('div').text()).toEqual(expectedMessage);
  });

  it('should match account activated success message', () => {
    const accountActivationMessage = mount(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.SUCCESS} />
      </IntlProvider>,
    );

    const expectedMessage = 'Success! You have activated your account.'
                            + 'You will now receive email updates and alerts from us related to '
                            + 'the courses you are enrolled in. Sign in to continue.';
    expect(accountActivationMessage.find('#account-activation-message').first().text()).toEqual(expectedMessage);
  });

  it('should match account activation error message', () => {
    const accountActivationMessage = mount(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.ERROR} />
      </IntlProvider>,
    );

    const expectedMessage = 'Your account could not be activated'
                            + 'Something went wrong, please contact support to resolve this issue.';
    expect(accountActivationMessage.find('#account-activation-message').first().text()).toEqual(expectedMessage);
  });

  it('should not display anything for invalid message type', () => {
    const accountActivationMessage = mount(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType="invalid-message" />
      </IntlProvider>,
    );

    expect(accountActivationMessage).toEqual({});
  });
});
