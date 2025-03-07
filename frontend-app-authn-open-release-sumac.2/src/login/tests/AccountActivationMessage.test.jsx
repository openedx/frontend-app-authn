import React from 'react';

import { mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render, screen,
} from '@testing-library/react';

import AccountActivationMessage from '../AccountActivationMessage';
import { ACCOUNT_ACTIVATION_MESSAGE } from '../data/constants';

const IntlAccountActivationMessage = injectIntl(AccountActivationMessage);

describe('AccountActivationMessage', () => {
  beforeEach(() => {
    mergeConfig({
      MARKETING_EMAILS_OPT_IN: '',
    });
  });

  it('should match account already activated message', () => {
    render(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.INFO} />
      </IntlProvider>,
    );

    const expectedMessage = 'This account has already been activated.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match account activated success message', () => {
    render(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.SUCCESS} />
      </IntlProvider>,
    );

    const expectedMessage = 'Success! You have activated your account.'
                            + 'You will now receive email updates and alerts from us related to '
                            + 'the courses you are enrolled in. Sign in to continue.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match account activation error message', () => {
    render(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.ERROR} />
      </IntlProvider>,
    );

    const expectedMessage = 'Your account could not be activated'
                            + 'Something went wrong, please contact support to resolve this issue.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should not display anything for invalid message type', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType="invalid-message" />
      </IntlProvider>,
    );

    const accountActivationMessage = container.querySelectorAll('#account-activation-message');
    expect(accountActivationMessage[0]).toBe(undefined);
  });
});

describe('EmailConfirmationMessage', () => {
  beforeEach(() => {
    mergeConfig({
      MARKETING_EMAILS_OPT_IN: 'true',
    });
  });

  it('should match email already confirmed message', () => {
    render(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.INFO} />
      </IntlProvider>,
    );

    const expectedMessage = 'This email has already been confirmed.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match email confirmation success message', () => {
    render(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.SUCCESS} />
      </IntlProvider>,
    );
    const expectedMessage = 'Success! You have confirmed your email.Sign in to continue.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match email confirmation error message', () => {
    render(
      <IntlProvider locale="en">
        <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.ERROR} />
      </IntlProvider>,
    );
    const expectedMessage = 'Your email could not be confirmed'
                            + 'Something went wrong, please contact support to resolve this issue.';
    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });
});
