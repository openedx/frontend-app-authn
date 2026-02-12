import {
  act, render, renderHook, screen,
} from '@testing-library/react';

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

  describe('RegisterContext Actions', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RegisterProvider>{children}</RegisterProvider>
    );

    it('should handle SET_VALIDATIONS_SUCCESS action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      const validationData = {
        validationDecisions: { username: 'Username is valid' },
        usernameSuggestions: ['user1', 'user2'],
      };

      act(() => {
        result.current.setValidationsSuccess(validationData);
      });

      expect(result.current.validations).toEqual({
        validationDecisions: { username: 'Username is valid' },
      });
      expect(result.current.usernameSuggestions).toEqual(['user1', 'user2']);
      expect(result.current.validationApiRateLimited).toBe(false);
    });

    it('should handle SET_VALIDATIONS_SUCCESS without usernameSuggestions', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      const validationData = {
        validationDecisions: { username: 'Username is valid' },
      };

      act(() => {
        result.current.setValidationsSuccess(validationData);
      });

      expect(result.current.validations).toEqual({
        validationDecisions: { username: 'Username is valid' },
      });
      expect(result.current.usernameSuggestions).toEqual([]);
    });

    it('should handle SET_VALIDATIONS_FAILURE action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      act(() => {
        result.current.setValidationsFailure();
      });

      expect(result.current.validationApiRateLimited).toBe(true);
      expect(result.current.validations).toBe(null);
    });

    it('should handle CLEAR_USERNAME_SUGGESTIONS action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      act(() => {
        result.current.setValidationsSuccess({
          validationDecisions: {},
          usernameSuggestions: ['user1', 'user2'],
        });
      });

      expect(result.current.usernameSuggestions).toEqual(['user1', 'user2']);

      act(() => {
        result.current.clearUsernameSuggestions();
      });

      expect(result.current.usernameSuggestions).toEqual([]);
    });

    it('should handle CLEAR_REGISTRATION_BACKEND_ERROR action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      act(() => {
        result.current.setRegistrationError({
          username: [{ userMessage: 'Username error' }],
          email: [{ userMessage: 'Email error' }],
        });
      });

      expect(result.current.registrationError).toEqual({
        username: [{ userMessage: 'Username error' }],
        email: [{ userMessage: 'Email error' }],
      });

      act(() => {
        result.current.clearRegistrationBackendError('username');
      });

      expect(result.current.registrationError).toEqual({
        email: [{ userMessage: 'Email error' }],
      });
    });

    it('should handle SET_BACKEND_COUNTRY_CODE action when no country is set', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      act(() => {
        result.current.setBackendCountryCode('US');
      });

      expect(result.current.backendCountryCode).toBe('US');
    });

    it('should handle SET_BACKEND_COUNTRY_CODE action when country is already set', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });
      act(() => {
        result.current.setRegistrationFormData({
          ...result.current.registrationFormData,
          configurableFormFields: {
            ...result.current.registrationFormData.configurableFormFields,
            country: 'CA',
          },
        });
      });

      act(() => {
        result.current.setBackendCountryCode('US');
      });

      expect(result.current.backendCountryCode).toBe('');
    });

    it('should handle SET_EMAIL_SUGGESTION action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      act(() => {
        result.current.setEmailSuggestionContext('test@gmail.com', 'warning');
      });

      expect(result.current.registrationFormData.emailSuggestion).toEqual({
        suggestion: 'test@gmail.com',
        type: 'warning',
      });
    });

    it('should handle UPDATE_REGISTRATION_FORM_DATA action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      const updateData = {
        formFields: {
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          password: 'password123',
        },
      };

      act(() => {
        result.current.updateRegistrationFormData(updateData);
      });

      expect(result.current.registrationFormData.formFields).toEqual(updateData.formFields);
    });

    it('should handle SET_REGISTRATION_FORM_DATA action with object', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      const newFormData = {
        configurableFormFields: { marketingEmailsOptIn: false },
        formFields: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          username: 'janedoe',
          password: 'password456',
        },
        emailSuggestion: { suggestion: 'jane@gmail.com', type: 'warning' },
        errors: {
          name: '',
          email: '',
          username: '',
          password: '',
        },
      };

      act(() => {
        result.current.setRegistrationFormData(newFormData);
      });

      expect(result.current.registrationFormData).toEqual(newFormData);
    });

    it('should handle SET_REGISTRATION_FORM_DATA action with function', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      act(() => {
        result.current.setRegistrationFormData((prev) => ({
          ...prev,
          formFields: {
            ...prev.formFields,
            name: 'Updated Name',
          },
        }));
      });

      expect(result.current.registrationFormData.formFields.name).toBe('Updated Name');
    });

    it('should handle SET_REGISTRATION_RESULT action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      const registrationResult = {
        success: true,
        redirectUrl: '/dashboard',
        authenticatedUser: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      act(() => {
        result.current.setRegistrationResult(registrationResult);
      });

      expect(result.current.registrationResult).toEqual(registrationResult);
    });

    it('should handle SET_REGISTRATION_ERROR action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      const registrationError = {
        username: [{ userMessage: 'Username already exists' }],
        email: [{ userMessage: 'Email already registered' }],
      };

      act(() => {
        result.current.setRegistrationError(registrationError);
      });

      expect(result.current.registrationError).toEqual(registrationError);
    });

    it('should handle SET_USER_PIPELINE_DATA_LOADED action', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      expect(result.current.userPipelineDataLoaded).toBe(false);

      act(() => {
        result.current.setUserPipelineDataLoaded(true);
      });

      expect(result.current.userPipelineDataLoaded).toBe(true);
    });

    it('should process backend validations from validations state', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      act(() => {
        result.current.setValidationsSuccess({
          validationDecisions: {
            username: 'Username is valid',
            email: 'Email is valid',
          },
        });
      });

      expect(result.current.backendValidations).toEqual({
        username: 'Username is valid',
        email: 'Email is valid',
      });
    });

    it('should process backend validations from registrationError state', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });

      act(() => {
        result.current.setRegistrationError({
          username: [{ userMessage: 'Username error' }],
          email: [{ userMessage: 'Email error' }],
          errorCode: [{ userMessage: 'Should be filtered out' }],
          usernameSuggestions: [{ userMessage: 'Should be filtered out' }],
        });
      });

      expect(result.current.backendValidations).toEqual({
        username: 'Username error',
        email: 'Email error',
      });
    });

    it('should return null for backendValidations when neither validations nor registrationError exist', () => {
      const { result } = renderHook(() => useRegisterContext(), { wrapper });
      expect(result.current.backendValidations).toBe(null);
    });
  });

  it('should throw error when useRegisterContext is used outside RegisterProvider', () => {
    const TestErrorComponent = () => {
      const context = useRegisterContext();
      return <div>{JSON.stringify(context.validations)}</div>;
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestErrorComponent />);
    }).toThrow('useRegisterContext must be used within a RegisterProvider');

    consoleSpy.mockRestore();
  });
});
