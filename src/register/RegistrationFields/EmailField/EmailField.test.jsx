import { getConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { RegisterProvider, useRegisterContext } from '../../components/RegisterContext';
import { useFieldValidations } from '../../data/apiHook';
import { EmailField } from '../index';

// Mock the useRegisterContext hook
jest.mock('../../components/RegisterContext', () => ({
  ...jest.requireActual('../../components/RegisterContext'),
  useRegisterContext: jest.fn(),
}));

// Mock the useFieldValidations hook
jest.mock('../../data/api.hook', () => ({
  useFieldValidations: jest.fn(),
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

describe('EmailField', () => {
  let props = {};
  let queryClient;
  let mockMutate;
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
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    mockMutate = jest.fn();
    useFieldValidations.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    mockRegisterContext = {
      setValidationsSuccess: jest.fn(),
      setValidationsFailure: jest.fn(),
      validationApiRateLimited: false,
      clearRegistrationBackendError: jest.fn(),
      registrationFormData: {
        emailSuggestion: {
          suggestion: 'example@gmail.com',
          type: 'warning',
        },
      },
      setEmailSuggestionContext: jest.fn(),
    };

    useRegisterContext.mockReturnValue(mockRegisterContext);
    props = {
      name: 'email',
      value: '',
      errorMessage: '',
      handleChange: jest.fn(),
      floatingLabel: '',
      handleErrorChange: jest.fn(),
      confirmEmailValue: '',
    };
    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Test Email Field', () => {
    const emptyFieldValidation = {
      email: 'Enter your email',
    };

    it('should run email field validation when onBlur is fired', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: '', name: 'email' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        emptyFieldValidation.email,
      );
    });

    it('should update errors for frontend validations', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'ab', name: 'email' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        'Enter a valid email address',
      );
    });

    it('should clear error on focus', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.focus(emailInput, { target: { value: '', name: 'email' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        '',
      );
    });

    it('should call backend validation api on blur event, if frontend validations have passed', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      // Enter a valid email so that frontend validations are passed
      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'test@gmail.com', name: 'email' } });

      expect(mockMutate).toHaveBeenCalledWith({ email: 'test@gmail.com' });
    });

    it('should give email suggestions for common service provider domain typos', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'john@yopmail.com', name: 'email' } });

      const emailWarning = container.querySelector('#email-warning');
      expect(emailWarning.textContent).toEqual('Did you mean: john@hotmail.com?');
    });

    it('should be able to click on email suggestions and set it as value', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'john@yopmail.com', name: 'email' } });

      const emailSuggestion = container.querySelector('.email-suggestion-alert-warning');
      fireEvent.click(emailSuggestion);

      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'email', value: 'john@hotmail.com' } },
      );
    });

    it('should give error for common top level domain mistakes', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'john@gmail.mistake', name: 'email' } });

      const errorElement = container.querySelector('.alert-danger');
      expect(errorElement.textContent).toEqual('Did you mean john@gmail.com?');
    });

    it('should give error and suggestion for invalid email', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'john@gmail', name: 'email' } });

      const errorElement = container.querySelector('.alert-danger');
      expect(errorElement.textContent).toEqual('Did you mean john@gmail.com?');

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        'Enter a valid email address',
      );
    });

    it('should clear the registration validation error on focus on field', () => {
      // Mock context with registration error
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        registrationError: {
          errorCode: 'duplicate-email',
          email: [{ userMessage: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account` }],
        },
      });

      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.focus(emailInput, { target: { value: 'a@gmail.com', name: 'email' } });

      expect(mockRegisterContext.clearRegistrationBackendError).toHaveBeenCalledWith('email');
    });

    it('should clear email suggestions when close icon is clicked', () => {
      const { container } = render(renderWrapper(<EmailField {...props} />));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'john@gmail.mistake', name: 'email' } });

      const suggestionText = container.querySelector('.alert-danger');
      expect(suggestionText.textContent).toEqual('Did you mean john@gmail.com?');

      const closeButton = container.querySelector('.email-suggestion__close');
      fireEvent.click(closeButton);

      const closedSuggestionText = container.querySelector('.alert-danger');
      expect(closedSuggestionText).toBeNull();
    });

    it('should set confirm email error if it exist', () => {
      props = {
        ...props,
        confirmEmailValue: 'confirmEmail@yopmail.com',
      };

      const { container } = render(renderWrapper(<EmailField {...props} />));
      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'differentEmail@yopmail.com', name: 'email' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'confirm_email',
        'The email addresses do not match.',
      );
    });
  });
});
