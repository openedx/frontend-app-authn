import React from 'react';
import { Provider } from 'react-redux';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { clearRegistrationBackendError, fetchRealtimeValidations } from '../../data/actions';
import { NameField } from '../index';

const IntlNameField = injectIntl(NameField);
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

describe('NameField', () => {
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
    register: {},
  };

  beforeEach(() => {
    store = mockStore(initialState);
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
  });

  describe('Test Name Field', () => {
    const fieldValidation = { name: 'Enter your full name' };

    it('should run name field validation when onBlur is fired', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const nameInput = container.querySelector('input#name');
      fireEvent.blur(nameInput, { target: { value: '', name: 'name' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        fieldValidation.name,
      );
    });

    it('should update errors for frontend validations', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const nameInput = container.querySelector('input#name');
      fireEvent.blur(nameInput, { target: { value: 'https://invalid-name.com', name: 'name' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        'Enter a valid name',
      );
    });

    it('should validate for full name length', () => {
      const longName = `
        5cnx16mn7qTSbtiha1W473ZtV5prGBCEtNrfLkqizJirf
        v5kbzBpLRbdh7FY5qujb8viQ9zPziE1fWnbFu5tj4FXaY5GDESvVwjQkE
        txUPE3r9mk4HYcSfXVJPWAWRuK2LJZycZWDm0BMFLZ63YdyQAZhjyvjn7
        SCqKjSHDx7mgwFp35PF4CxwtwNLxY11eqf5F88wQ9k2JQ9U8uKSFyTKCM
        A456CGA5KjUugYdT1qKdvvnXtaQr8WA87m9jpe16
      `;
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));
      const nameInput = container.querySelector('input#name');
      fireEvent.blur(nameInput, { target: { value: longName, name: 'name' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        'Full name cannot be longer than 255 characters',
      );
    });

    it('should clear error on focus', () => {
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const nameInput = container.querySelector('input#name');
      fireEvent.focus(nameInput, { target: { value: '', name: 'name' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        '',
      );
    });

    it('should call backend validation api on blur event, if frontend validations have passed', () => {
      store.dispatch = jest.fn(store.dispatch);
      props = {
        ...props,
        shouldFetchUsernameSuggestions: true,
      };
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const nameInput = container.querySelector('input#name');
      // Enter a valid name so that frontend validations are passed
      fireEvent.blur(nameInput, { target: { value: 'test', name: 'name' } });

      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({ name: 'test' }));
    });

    it('should clear the registration validation error on focus on field', () => {
      const nameError = 'temp error';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            name: [{ userMessage: nameError }],
          },
        },
      });

      store.dispatch = jest.fn(store.dispatch);
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const nameInput = container.querySelector('input#name');

      fireEvent.focus(nameInput, { target: { value: 'test', name: 'name' } });

      expect(store.dispatch).toHaveBeenCalledWith(clearRegistrationBackendError('name'));
    });
  });
});
