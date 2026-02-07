import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { RegisterProvider, useRegisterContext } from '../../components/RegisterContext';
import { NameField } from '../index';

// Mock the useFieldValidations hook
const mockMutate = jest.fn();
jest.mock('../../data/api.hook', () => ({
  useFieldValidations: () => ({
    mutate: mockMutate,
  }),
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

describe('NameField', () => {
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

    mockRegisterContext = {
      setValidationsSuccess: jest.fn(),
      setValidationsFailure: jest.fn(),
      validationApiRateLimited: false,
      clearRegistrationBackendError: jest.fn(),
      registrationFormData: {},
      validationErrors: {},
    };

    useRegisterContext.mockReturnValue(mockRegisterContext);

    props = {
      name: 'name',
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
  });

  describe('Test Name Field', () => {
    const fieldValidation = { name: 'Enter your full name' };

    it('should run name field validation when onBlur is fired', () => {
      const { container } = render(renderWrapper(<NameField {...props} />));

      const nameInput = container.querySelector('input#name');
      fireEvent.blur(nameInput, { target: { value: '', name: 'name' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        fieldValidation.name,
      );
    });

    it('should update errors for frontend validations', () => {
      const { container } = render(renderWrapper(<NameField {...props} />));

      const nameInput = container.querySelector('input#name');
      fireEvent.blur(nameInput, { target: { value: 'https://invalid-name.com', name: 'name' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        'Enter a valid name',
      );
    });

    it('should clear error on focus', () => {
      const { container } = render(renderWrapper(<NameField {...props} />));

      const nameInput = container.querySelector('input#name');
      fireEvent.focus(nameInput, { target: { value: '', name: 'name' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        '',
      );
    });

    it('should call backend validation api on blur event, if frontend validations have passed', () => {
      props = {
        ...props,
        shouldFetchUsernameSuggestions: true,
      };
      const { container } = render(renderWrapper(<NameField {...props} />));
      const nameInput = container.querySelector('input#name');
      // Enter a valid name so that frontend validations are passed
      fireEvent.blur(nameInput, { target: { value: 'test', name: 'name' } });

      expect(mockMutate).toHaveBeenCalledWith({ name: 'test' });
    });

    it('should clear the registration validation error on focus on field', () => {
      const nameError = 'temp error';
      useRegisterContext.mockReturnValue({
        ...mockRegisterContext,
        validationErrors: {
          name: [{ userMessage: nameError }],
        },
      });

      const { container } = render(renderWrapper(<NameField {...props} />));
      const nameInput = container.querySelector('input#name');
      fireEvent.focus(nameInput, { target: { value: 'test', name: 'name' } });

      expect(mockRegisterContext.clearRegistrationBackendError).toHaveBeenCalledWith('name');
    });
  });
});
