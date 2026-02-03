import { renderHook, act } from '@testing-library/react';
import { useLoginForm, LoginFormProvider } from '../useLoginForm';

describe('useLoginForm', () => {
  const wrapper = ({ children, initialState }) => (
    <LoginFormProvider initialState={initialState}>
      {children}
    </LoginFormProvider>
  );

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    expect(result.current.formFields).toEqual({
      emailOrUsername: '',
      password: '',
    });
    expect(result.current.errors).toEqual({
      emailOrUsername: '',
      password: '',
    });
    expect(result.current.errorCode).toEqual({
      type: '',
      count: 0,
      context: {},
    });
    expect(result.current.showResetPasswordSuccessBanner).toBe(false);
  });

  it('should initialize with custom initial state', () => {
    const initialState = {
      formFields: {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      },
      errors: {
        emailOrUsername: 'Email error',
        password: 'Password error',
      },
    };

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: ({ children }) => wrapper({ children, initialState }),
    });

    expect(result.current.formFields).toEqual({
      emailOrUsername: 'test@example.com',
      password: 'password123',
    });
    expect(result.current.errors).toEqual({
      emailOrUsername: 'Email error',
      password: 'Password error',
    });
  });

  it('should update form field', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    act(() => {
      result.current.updateField('emailOrUsername', 'test@example.com');
    });

    expect(result.current.formFields.emailOrUsername).toBe('test@example.com');
    expect(result.current.formFields.password).toBe(''); // other field unchanged
  });

  it('should set errors', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    const newErrors = {
      emailOrUsername: 'Email is required',
      password: 'Password is required',
    };

    act(() => {
      result.current.setErrors(newErrors);
    });

    expect(result.current.errors).toEqual(newErrors);
  });

  it('should set error code and increment count', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    act(() => {
      result.current.setErrorCode('invalid-credentials', { email: 'test@example.com' });
    });

    expect(result.current.errorCode).toEqual({
      type: 'invalid-credentials',
      count: 1,
      context: { email: 'test@example.com' },
    });

    // Set another error, count should increment
    act(() => {
      result.current.setErrorCode('forbidden-request');
    });

    expect(result.current.errorCode).toEqual({
      type: 'forbidden-request',
      count: 2,
      context: {},
    });
  });

  it('should clear field error', () => {
    const initialState = {
      errors: {
        emailOrUsername: 'Email error',
        password: 'Password error',
      },
    };

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: ({ children }) => wrapper({ children, initialState }),
    });

    act(() => {
      result.current.clearFieldError('emailOrUsername');
    });

    expect(result.current.errors).toEqual({
      emailOrUsername: '',
      password: 'Password error',
    });
  });

  it('should show and hide reset password banner', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    expect(result.current.showResetPasswordSuccessBanner).toBe(false);

    act(() => {
      result.current.showResetPasswordBanner();
    });

    expect(result.current.showResetPasswordSuccessBanner).toBe(true);

    act(() => {
      result.current.hideResetPasswordBanner();
    });

    expect(result.current.showResetPasswordSuccessBanner).toBe(false);
  });

  it('should reset form', () => {
    const initialState = {
      formFields: {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      },
      errors: {
        emailOrUsername: 'Email error',
        password: 'Password error',
      },
      showResetPasswordSuccessBanner: true,
    };

    const { result } = renderHook(() => useLoginForm(), {
      wrapper: ({ children }) => wrapper({ children, initialState }),
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formFields).toEqual({
      emailOrUsername: '',
      password: '',
    });
    expect(result.current.errors).toEqual({
      emailOrUsername: '',
      password: '',
    });
    expect(result.current.showResetPasswordSuccessBanner).toBe(false);
  });

  it('should reset form with new state', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });

    const newState = {
      formFields: {
        emailOrUsername: 'new@example.com',
        password: 'newpassword',
      },
      showResetPasswordSuccessBanner: true,
    };

    act(() => {
      result.current.resetForm(newState);
    });

    expect(result.current.formFields).toEqual({
      emailOrUsername: 'new@example.com',
      password: 'newpassword',
    });
    expect(result.current.showResetPasswordSuccessBanner).toBe(true);
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useLoginForm());
    }).toThrow('useLoginForm must be used within a LoginFormProvider');

    consoleSpy.mockRestore();
  });
});