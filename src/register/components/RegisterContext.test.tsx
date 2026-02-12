import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { RegisterProvider, useRegisterContext } from './RegisterContext';

const TestComponent = () => {
  const {
    validations,
    submitState,
    userPipelineDataLoaded,
    registrationFormData,
    registrationResult,
    registrationError,
    backendCountryCode,
    usernameSuggestions,
    validationApiRateLimited,
    shouldBackupState,
    backendValidations,
  } = useRegisterContext();

  return (
    <div>
      <div>{validations !== null ? 'Validations Available' : 'Validations Not Available'}</div>
      <div>{submitState ? 'SubmitState Available' : 'SubmitState Not Available'}</div>
      <div>{userPipelineDataLoaded !== undefined ? 'UserPipelineDataLoaded Available' : 'UserPipelineDataLoaded Not Available'}</div>
      <div>{registrationFormData ? 'RegistrationFormData Available' : 'RegistrationFormData Not Available'}</div>
      <div>{registrationResult ? 'RegistrationResult Available' : 'RegistrationResult Not Available'}</div>
      <div>{registrationError !== undefined ? 'RegistrationError Available' : 'RegistrationError Not Available'}</div>
      <div>{backendCountryCode !== undefined ? 'BackendCountryCode Available' : 'BackendCountryCode Not Available'}</div>
      <div>{usernameSuggestions ? 'UsernameSuggestions Available' : 'UsernameSuggestions Not Available'}</div>
      <div>{validationApiRateLimited !== undefined ? 'ValidationApiRateLimited Available' : 'ValidationApiRateLimited Not Available'}</div>
      <div>{shouldBackupState !== undefined ? 'ShouldBackupState Available' : 'ShouldBackupState Not Available'}</div>
      <div>{backendValidations !== undefined ? 'BackendValidations Available' : 'BackendValidations Not Available'}</div>
    </div>
  );
};

describe('RegisterContext', () => {
  it('should render children', () => {
    render(
      <RegisterProvider>
        <div>Test Child</div>
      </RegisterProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide all context values to children', () => {
    render(
      <RegisterProvider>
        <TestComponent />
      </RegisterProvider>,
    );

    expect(screen.getByText('Validations Not Available')).toBeInTheDocument();
    expect(screen.getByText('SubmitState Available')).toBeInTheDocument();
    expect(screen.getByText('UserPipelineDataLoaded Available')).toBeInTheDocument();
    expect(screen.getByText('RegistrationFormData Available')).toBeInTheDocument();
    expect(screen.getByText('RegistrationResult Available')).toBeInTheDocument();
    expect(screen.getByText('RegistrationError Available')).toBeInTheDocument();
    expect(screen.getByText('BackendCountryCode Available')).toBeInTheDocument();
    expect(screen.getByText('UsernameSuggestions Available')).toBeInTheDocument();
    expect(screen.getByText('ValidationApiRateLimited Available')).toBeInTheDocument();
    expect(screen.getByText('ShouldBackupState Available')).toBeInTheDocument();
    expect(screen.getByText('BackendValidations Available')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <RegisterProvider>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </RegisterProvider>,
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });
});
