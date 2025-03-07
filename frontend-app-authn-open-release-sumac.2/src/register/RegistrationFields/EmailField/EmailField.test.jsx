import React from 'react';
import { Provider } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { clearRegistrationBackendError, fetchRealtimeValidations } from '../../data/actions';
import { EmailField } from '../index';

const IntlEmailField = injectIntl(EmailField);
const mockStore = configureStore();

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
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const routerWrapper = children => (
    <Router>
      {children}
    </Router>
  );

  const initialState = {
    register: {
      registrationFormData: {
        emailSuggestion: {
          suggestion: 'example@gmail.com',
          type: 'warning',
        },
      },
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
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
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: '', name: 'email' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        emptyFieldValidation.email,
      );
    });

    it('should update errors for frontend validations', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'ab', name: 'email' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        'Enter a valid email address',
      );
    });

    it('should clear error on focus', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      const emailInput = container.querySelector('input#email');
      fireEvent.focus(emailInput, { target: { value: '', name: 'email' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        '',
      );
    });

    it('should call backend validation api on blur event, if frontend validations have passed', () => {
      store.dispatch = jest.fn(store.dispatch);
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      // Enter a valid email so that frontend validations are passed
      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'test@gmail.com', name: 'email' } });

      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({ email: 'test@gmail.com' }));
    });

    it('should give email suggestions for common service provider domain typos', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'john@yopmail.com', name: 'email' } });

      const emailWarning = container.querySelector('#email-warning');
      expect(emailWarning.textContent).toEqual('Did you mean: john@hotmail.com?');
    });

    it('should be able to click on email suggestions and set it as value', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

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
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      const emailInput = container.querySelector('input#email');
      fireEvent.blur(emailInput, { target: { value: 'john@gmail.mistake', name: 'email' } });

      const errorElement = container.querySelector('.alert-danger');
      expect(errorElement.textContent).toEqual('Did you mean john@gmail.com?');
    });

    it('should give error and suggestion for invalid email', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

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
      store.dispatch = jest.fn(store.dispatch);
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            errorCode: 'duplicate-email',
            email: [{ userMessage: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account` }],
          },
        },
      });

      store.dispatch = jest.fn(store.dispatch);

      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      const emailInput = container.querySelector('input#email');
      fireEvent.focus(emailInput, { target: { value: 'a@gmail.com', name: 'email' } });

      expect(store.dispatch).toHaveBeenCalledWith(clearRegistrationBackendError('email'));
    });

    it('should clear email suggestions when close icon is clicked', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

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

      const { container } = render(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));
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
