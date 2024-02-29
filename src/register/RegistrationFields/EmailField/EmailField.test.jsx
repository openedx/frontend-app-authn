import React from 'react';
import { Provider } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
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
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      emailField.find('input#email').simulate('blur', { target: { value: '', name: 'email' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        emptyFieldValidation.email,
      );
    });

    it('should update errors for frontend validations', () => {
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      emailField.find('input#email').simulate('blur', { target: { value: 'ab', name: 'email' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        'Enter a valid email address',
      );
    });

    it('should clear error on focus', () => {
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      emailField.find('input#email').simulate('focus', { target: { value: '', name: 'email' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'email',
        '',
      );
    });

    it('should call backend validation api on blur event, if frontend validations have passed', () => {
      store.dispatch = jest.fn(store.dispatch);
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      // Enter a valid email so that frontend validations are passed
      emailField.find('input#email').simulate('blur', { target: { value: 'test@gmail.com', name: 'email' } });
      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({ email: 'test@gmail.com' }));
    });

    it('should give email suggestions for common service provider domain typos', () => {
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      emailField.find('input#email').simulate('blur', { target: { value: 'john@yopmail.com', name: 'email' } });

      expect(emailField.find('#email-warning').text()).toEqual('Did you mean: john@hotmail.com?');
    });

    it('should be able to click on email suggestions and set it as value', () => {
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      emailField.find('input#email').simulate('blur', { target: { value: 'john@yopmail.com', name: 'email' } });
      emailField.find('.email-suggestion-alert-warning').first().simulate('click');
      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'email', value: 'john@hotmail.com' } },
      );
    });

    it('should give error for common top level domain mistakes', () => {
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      emailField.find('input#email').simulate(
        'blur', { target: { value: 'john@gmail.mistake', name: 'email' } },
      );
      expect(emailField.find('.alert-danger').text()).toEqual('Did you mean john@gmail.com?');
    });

    it('should give error and suggestion for invalid email', () => {
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      emailField.find('input#email').simulate(
        'blur', { target: { value: 'john@gmail', name: 'email' } },
      );
      expect(emailField.find('.alert-danger').text()).toEqual('Did you mean john@gmail.com?');
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
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));
      emailField.find('input#email').simulate('focus', { target: { value: 'a@gmail.com', name: 'email' } });
      expect(store.dispatch).toHaveBeenCalledWith(clearRegistrationBackendError('email'));
    });

    it('should clear email suggestions when close icon is clicked', () => {
      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));

      emailField.find('input#email').simulate(
        'blur', { target: { value: 'john@gmail.mistake', name: 'email' } },
      );
      expect(emailField.find('.alert-danger').text()).toEqual('Did you mean john@gmail.com?');

      emailField.find('.email-suggestion__close').at(0).simulate('click');
      expect(emailField.find('.alert-danger').exists()).toBeFalsy();
    });

    it('should set confirm email error if it exist', () => {
      props = {
        ...props,
        confirmEmailValue: 'confirmEmail@yopmail.com',
      };

      const emailField = mount(routerWrapper(reduxWrapper(<IntlEmailField {...props} />)));
      emailField.find('input#email').simulate(
        'blur', { target: { value: 'differentEmail@yopmail.com', name: 'email' } },
      );
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'confirm_email',
        'The email addresses do not match.',
      );
    });
  });
});
