import React from 'react';
import { Provider } from 'react-redux';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
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
      const nameField = mount(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      nameField.find('input#name').simulate('blur', { target: { value: '', name: 'name' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        fieldValidation.name,
      );
    });

    it('should update errors for frontend validations', () => {
      const nameField = mount(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      nameField.find('input#name').simulate(
        'blur', { target: { value: 'https://invalid-name.com', name: 'name' } },
      );
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'name',
        'Enter a valid name',
      );
    });

    it('should clear error on focus', () => {
      const nameField = mount(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      nameField.find('input#name').simulate('focus', { target: { value: '', name: 'name' } });
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
      const nameField = mount(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));

      // Enter a valid name so that frontend validations are passed
      nameField.find('input#name').simulate('blur', { target: { value: 'test', name: 'name' } });
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
      const nameField = mount(routerWrapper(reduxWrapper(<IntlNameField {...props} />)));
      nameField.find('input#name').simulate('focus', { target: { value: 'test', name: 'name' } });
      expect(store.dispatch).toHaveBeenCalledWith(clearRegistrationBackendError('name'));
    });
  });
});
