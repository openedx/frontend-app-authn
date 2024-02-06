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
      name: '',
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
    it('should run first name field validation when onBlur is fired', () => {
      props.name = 'firstName';
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const firstNameInput = container.querySelector('input#firstName');
      fireEvent.blur(firstNameInput, { target: { value: '', name: 'firstName' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'firstName',
        'Enter your first name',
      );
    });

    it('should update first name field error for frontend validations', () => {
      props.name = 'firstName';
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const firstNameInput = container.querySelector('input#firstName');
      fireEvent.blur(firstNameInput, { target: { value: 'https://invalid-name.com', name: 'firstName' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'firstName',
        'Enter a valid first name',
      );
    });

    it('should clear first name error on focus', () => {
      props.name = 'firstName';
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const firstNameInput = container.querySelector('input#firstName');
      fireEvent.focus(firstNameInput, { target: { value: '', name: 'firstName' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'firstName',
        '',
      );
    });

    it('should call backend validation api on blur event, if frontend validations have passed', () => {
      store.dispatch = jest.fn(store.dispatch);
      props = {
        ...props,
        shouldFetchUsernameSuggestions: true,
        fullName: 'test test',
      };
      props.name = 'lastName';
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const lastNameInput = container.querySelector('input#lastName');
      // Enter a valid name so that frontend validations are passed
      fireEvent.blur(lastNameInput, { target: { value: 'test', name: 'lastName' } });

      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({ name: props.fullName }));
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

      props.name = 'lastName';
      store.dispatch = jest.fn(store.dispatch);
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const lastNameInput = container.querySelector('input#lastName');

      fireEvent.focus(lastNameInput, { target: { value: 'test', name: 'lastName' } });

      expect(store.dispatch).toHaveBeenCalledWith(clearRegistrationBackendError('lastName'));
    });

    it('should run last name field validation when onBlur is fired', () => {
      props.name = 'lastName';
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const lastNameInput = container.querySelector('input#lastName');
      fireEvent.blur(lastNameInput, { target: { value: '', name: 'lastName' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'lastName',
        'Enter your last name',
      );
    });

    it('should update last name field error for frontend validation', () => {
      props.name = 'lastName';
      const { container } = render(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      const lastNameInput = container.querySelector('input#lastName');
      fireEvent.blur(lastNameInput, { target: { value: 'https://invalid-name.com', name: 'lastName' } });

      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'lastName',
        'Enter a valid last name',
      );
    });
  });
});
