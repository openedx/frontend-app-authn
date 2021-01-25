import React from 'react';
import { mount } from 'enzyme';

import { mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';

import ConfirmationAlert from '../ConfirmationAlert';

const IntlConfirmationAlertMessage = injectIntl(ConfirmationAlert);

describe('ConfirmationAlert', () => {
  const supportLink = 'https://support.test.com/What-if-I-did-not-receive-a-password-reset-message';
  mergeConfig({
    PASSWORD_RESET_SUPPORT_LINK: supportLink,
  });

  it('should match default confirmation message', () => {
    const confirmationAlertMessage = mount(
      <IntlProvider locale="en">
        <IntlConfirmationAlertMessage email="test@example.com" />
      </IntlProvider>,
    );

    const expectedMessage = 'Check Your Email'
                            + 'You entered test@example.com. If this email address is associated with your edX account, '
                            + 'we will send a message with password recovery instructions to this email address.'
                            + 'If you do not receive a password reset message after 1 minute, verify that you entered '
                            + 'the correct email address, or check your spam folder.'
                            + 'If you need further assistance, contact technical support.';

    expect(confirmationAlertMessage.find('#confirmation-alert').first().text()).toEqual(expectedMessage);
    expect(confirmationAlertMessage.find('#confirmation-alert').find('a').props().href).toEqual(supportLink);
  });
});
