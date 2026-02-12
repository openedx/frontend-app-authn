import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { RegisterProvider, useRegisterContext } from '../../components/RegisterContext';
import { useFieldValidations } from '../../data/apiHook';
import { UsernameField } from '../index';

// Mock the useFieldValidations hook
const mockMutate = jest.fn();
jest.mock('../../data/apiHook', () => ({
  useFieldValidations: jest.fn(),
}));

// Mock the useRegisterContext hook
jest.mock('../../components/RegisterContext', () => ({
  ...jest.requireActual('../../components/RegisterContext'),
  useRegisterContext: jest.fn(),
}));

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

describe('UsernameField', () => {
  let props = {};
  let queryClient;
  let mockRegisterContext;

  const renderWrapper = (children) => (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <Router>
          <RegisterProvider>
            {children}
          </RegisterProvider>
        </Router>
      </IntlProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    useFieldValidations.mockReturnValue({
      mutate: mockMutate,
    });

    mockRegisterContext = {
      usernameSuggestions: [],
      validationApiRateLimited: false,
      setValidationsSuccess: jest.fn(),
      setValidationsFailure: jest.fn(),
      clearUsernameSuggestions: jest.fn(),
      clearRegistrationBackendError: jest.fn(),
      registrationFormData: {},
      validationErrors: {},
    };

    useRegisterContext.mockReturnValue(mockRegisterContext);

    props = {
      name: 'username',
      value: '',
      errorMessage: '',
      handleChange: jest.fn(),
      handleErrorChange: jest.fn(),
      floatingLabel: '',
    };
    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockMutate.mockClear();
    useFieldValidations.mockClear();
  });

  describe('Test Username Field', () => {
    const fieldValidation = {
      username: 'Username must be between 2 and 30 characters',
    };

    it('should run username field validation when onBlur is fired', () => {
      const { container } = render(renderWrapper(<UsernameField {...props} />));

      const usernameField = container.querySelector('input#username');
      fireEvent.blur(usernameField, { target: { value: '', name: 'username' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'username',
        fieldValidation.username,
      );
    });

    it('should update errors for frontend validations', () => {
      const { container } = render(renderWrapper(<UsernameField {...props} />));

      const usernameField = container.querySelector('input#username');
      fireEvent.blur(usernameField, { target: { value: 'user#', name: 'username' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'username',
        'Usernames can only contain letters (A-Z, a-z), numerals (0-9), underscores (_), and hyphens (-). Usernames cannot contain spaces',
      );
    });

    it('should clear error on focus', () => {
      const { container } = render(renderWrapper(<UsernameField {...props} />));

      const usernameField = container.querySelector('input#username');
      fireEvent.focus(usernameField, { target: { value: '', name: 'username' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'username',
        '',
      );
    });

    it('should remove space from field on focus if space exists', () => {
      const { container } = render(renderWrapper(<UsernameField {...props} />));

      const usernameField = container.querySelector('input#username');
      fireEvent.focus(usernameField, { target: { value: ' ', name: 'username' } });

      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'username', value: '' } },
      );
    });

    it('should call backend validation api on blur event, if frontend validations have passed', () => {
      const { container } = render(renderWrapper(<UsernameField {...props} />));

      const usernameField = container.querySelector('input#username');
      // Enter a valid username so that frontend validations are passed
      fireEvent.blur(usernameField, { target: { value: 'test', name: 'username' } });

      expect(mockMutate).toHaveBeenCalledWith({ username: 'test' });
    });

    it('should remove space from the start of username on change', () => {
      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameField = container.querySelector('input#username');
      fireEvent.change(usernameField, { target: { value: ' test-user', name: 'username' } });

      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'username', value: 'test-user' } },
      );
    });

    it('should not set username if it is more than 30 character long', () => {
      const { container } = render(renderWrapper(<UsernameField {...props} />));

      const usernameField = container.querySelector('input#username');
      fireEvent.change(usernameField, { target: { value: 'why_this_is_not_valid_username_', name: 'username' } });

      expect(props.handleChange).toHaveBeenCalledTimes(0);
    });

    it('should clear username suggestions when username field is focused in', () => {
      const { container } = render(renderWrapper(<UsernameField {...props} />));

      const usernameField = container.querySelector('input#username');
      fireEvent.focus(usernameField);

      expect(mockRegisterContext.clearUsernameSuggestions).toHaveBeenCalled();
    });

    it('should show username suggestions in case of conflict with an existing username', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        usernameSuggestions: ['test_1', 'test_12', 'test_123'],
      });

      props = {
        ...props,
        errorMessage: 'It looks like this username is already taken',
      };

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameSuggestions = container.querySelectorAll('button.username-suggestions--chip');
      expect(usernameSuggestions.length).toEqual(3);
    });

    it('should show username suggestions when they are populated', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        usernameSuggestions: ['test_1', 'test_12', 'test_123'],
      });

      props = {
        ...props,
        value: ' ',
      };

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameSuggestions = container.querySelectorAll('button.username-suggestions--chip');
      expect(usernameSuggestions.length).toEqual(3);
    });

    it('should show username suggestions even if there is an error in field', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        usernameSuggestions: ['test_1', 'test_12', 'test_123'],
      });

      props = {
        ...props,
        value: ' ',
        errorMessage: 'username error',
      };

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameSuggestions = container.querySelectorAll('button.username-suggestions--chip');
      expect(usernameSuggestions.length).toEqual(3);
    });

    it('should put space in username field if suggestions are populated', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        usernameSuggestions: ['test_1', 'test_12', 'test_123'],
      });

      render(renderWrapper(<UsernameField {...props} />));
      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'username', value: ' ' } },
      );
    });

    it('should set suggestion as username by clicking on it', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        usernameSuggestions: ['test_1', 'test_12', 'test_123'],
      });

      props = {
        ...props,
        value: ' ',
      };

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameSuggestion = container.querySelector('.username-suggestions--chip');
      fireEvent.click(usernameSuggestion);
      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'username', value: 'test_1' } },
      );
    });

    it('should clear username suggestions when close icon is clicked', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        usernameSuggestions: ['test_1', 'test_12', 'test_123'],
      });

      props = {
        ...props,
        value: ' ',
      };

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      let closeButton = container.querySelector('button.username-suggestions__close__button');
      fireEvent.click(closeButton);
      expect(mockRegisterContext.clearUsernameSuggestions).toHaveBeenCalled();

      props = {
        ...props,
        errorMessage: 'username error',
      };

      render(renderWrapper(<UsernameField {...props} />));
      closeButton = container.querySelector('button.username-suggestions__close__button');
      fireEvent.click(closeButton);
      expect(mockRegisterContext.clearUsernameSuggestions).toHaveBeenCalled();
    });

    it('should clear the registration validation error on focus on field', () => {
      const usernameError = 'It looks like this username is already taken';
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        validationErrors: {
          username: [{ userMessage: usernameError }],
        },
      });

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameField = container.querySelector('input#username');
      fireEvent.focus(usernameField, { target: { value: 'test', name: 'username' } });

      expect(mockRegisterContext.clearRegistrationBackendError).toHaveBeenCalledWith('username');
    });

    it('should call setValidationsSuccess when field validation API succeeds', () => {
      let capturedOnSuccess;
      useFieldValidations.mockImplementation((callbacks) => {
        capturedOnSuccess = callbacks.onSuccess;
        return {
          mutate: mockMutate,
        };
      });

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameField = container.querySelector('input#username');
      fireEvent.blur(usernameField, { target: { value: 'testuser', name: 'username' } });
      const mockValidationData = { username: { isValid: true } };
      capturedOnSuccess(mockValidationData);

      expect(mockRegisterContext.setValidationsSuccess).toHaveBeenCalledWith(mockValidationData);
    });

    it('should call setValidationsFailure when field validation API fails', () => {
      let capturedOnError;
      useFieldValidations.mockImplementation((callbacks) => {
        capturedOnError = callbacks.onError;
        return {
          mutate: mockMutate,
        };
      });

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameField = container.querySelector('input#username');
      fireEvent.blur(usernameField, { target: { value: 'testuser', name: 'username' } });
      capturedOnError();

      expect(mockRegisterContext.setValidationsFailure).toHaveBeenCalledWith();
    });

    it('should not call field validation API when validation is rate limited', () => {
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        validationApiRateLimited: true,
      });

      const { container } = render(renderWrapper(<UsernameField {...props} />));
      const usernameField = container.querySelector('input#username');
      fireEvent.blur(usernameField, { target: { value: 'testuser', name: 'username' } });
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });
});
