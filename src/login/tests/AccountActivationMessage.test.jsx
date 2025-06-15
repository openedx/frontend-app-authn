import { CurrentAppProvider, injectIntl, IntlProvider, mergeAppConfig } from '@openedx/frontend-base';
import {
  render, screen,
} from '@testing-library/react';


import { testAppId } from '../../setupTest';
import { ACCOUNT_ACTIVATION_MESSAGE } from '../data/constants';
import AccountActivationMessage from '../AccountActivationMessage';

const IntlAccountActivationMessage = injectIntl(AccountActivationMessage);
const providerWrapper = children => (
  <IntlProvider locale="en">
    <CurrentAppProvider appId={testAppId}>
      {children}
    </CurrentAppProvider>
  </IntlProvider>
);

describe('AccountActivationMessage', () => {
  beforeEach(() => {
    mergeAppConfig({
      MARKETING_EMAILS_OPT_IN: '',
    });
  });

  it('should match account already activated message', () => {
    render(providerWrapper(
      <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.INFO} />
    ));

    const expectedMessage = 'This account has already been activated.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match account activated success message', () => {
    render(providerWrapper(
      <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.SUCCESS} />
    ));

    const expectedMessage = 'Success! You have activated your account.'
      + 'You will now receive email updates and alerts from us related to '
      + 'the courses you are enrolled in. Sign in to continue.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match account activation error message', () => {
    render(providerWrapper(
      <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.ERROR} />
    ));

    const expectedMessage = 'Your account could not be activated'
      + 'Something went wrong, please contact support to resolve this issue.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should not display anything for invalid message type', () => {
    const { container } = render(providerWrapper(
      <IntlAccountActivationMessage messageType="invalid-message" />
    ));

    const accountActivationMessage = container.querySelectorAll('#account-activation-message');
    expect(accountActivationMessage[0]).toBe(undefined);
  });
});

describe('EmailConfirmationMessage', () => {
  beforeEach(() => {
    mergeAppConfig({
      MARKETING_EMAILS_OPT_IN: 'true',
    });
  });

  it('should match email already confirmed message', () => {
    render(providerWrapper(
      <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.INFO} />
    ));

    const expectedMessage = 'This account has already been activated.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match email confirmation success message', () => {
    render(providerWrapper(
      <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.SUCCESS} />
    ));
    const expectedMessage = 'Success! You have activated your account.You will now receive email updates and alerts from us related to the courses you are enrolled in. Sign in to continue.';

    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });

  it('should match email confirmation error message', () => {
    render(providerWrapper(
      <IntlAccountActivationMessage messageType={ACCOUNT_ACTIVATION_MESSAGE.ERROR} />
    ));
    const expectedMessage = 'Your account could not be activated'
      + 'Something went wrong, please contact support to resolve this issue.';
    expect(screen.getByText(
      '',
      { selector: '#account-activation-message' },
    ).textContent).toBe(expectedMessage);
  });
});
