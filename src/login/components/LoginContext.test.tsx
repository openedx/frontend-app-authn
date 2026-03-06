import { render, screen } from '@testing-library/react';

import { LoginProvider, useLoginContext } from './LoginContext';

const TestComponent = () => {
  const {
    formFields,
    errors,
  } = useLoginContext();

  return (
    <div>
      <div>{formFields ? 'FormFields Available' : 'FormFields Not Available'}</div>
      <div>{formFields.emailOrUsername !== undefined ? 'EmailOrUsername Field Available' : 'EmailOrUsername Field Not Available'}</div>
      <div>{formFields.password !== undefined ? 'Password Field Available' : 'Password Field Not Available'}</div>
      <div>{errors ? 'Errors Available' : 'Errors Not Available'}</div>
      <div>{errors.emailOrUsername !== undefined ? 'EmailOrUsername Error Available' : 'EmailOrUsername Error Not Available'}</div>
      <div>{errors.password !== undefined ? 'Password Error Available' : 'Password Error Not Available'}</div>
    </div>
  );
};

describe('LoginContext', () => {
  it('should render children', () => {
    render(
      <LoginProvider>
        <div>Test Child</div>
      </LoginProvider>,
    );

    expect(screen.getByText('Test Child')).toBeTruthy();
  });

  it('should provide all context values to children', () => {
    render(
      <LoginProvider>
        <TestComponent />
      </LoginProvider>,
    );

    expect(screen.getByText('FormFields Available')).toBeTruthy();
    expect(screen.getByText('EmailOrUsername Field Available')).toBeTruthy();
    expect(screen.getByText('Password Field Available')).toBeTruthy();
    expect(screen.getByText('Errors Available')).toBeTruthy();
    expect(screen.getByText('EmailOrUsername Error Available')).toBeTruthy();
    expect(screen.getByText('Password Error Available')).toBeTruthy();
  });

  it('should render multiple children', () => {
    render(
      <LoginProvider>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </LoginProvider>,
    );

    expect(screen.getByText('First Child')).toBeTruthy();
    expect(screen.getByText('Second Child')).toBeTruthy();
    expect(screen.getByText('Third Child')).toBeTruthy();
  });
});
