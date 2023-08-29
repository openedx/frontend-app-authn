import React from 'react';
import { Provider } from 'react-redux';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { clearRegistrationBackendError, clearUsernameSuggestions, fetchRealtimeValidations } from '../../data/actions';
import { UsernameField } from '../index';

const IntlUsernameField = injectIntl(UsernameField);
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

describe('UsernameField', () => {
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
      usernameSuggestions: [],
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
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
  });

  describe('Test Username Field', () => {
    const fieldValidation = {
      username: 'Username must be between 2 and 30 characters',
    };

    it('should run username field validation when onBlur is fired', () => {
      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));

      usernameField.find('input#username').simulate('blur', { target: { value: '', name: 'username' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'username',
        fieldValidation.username,
      );
    });

    it('should update errors for frontend validations', () => {
      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));

      usernameField.find('input#username').simulate('blur', { target: { value: 'user#', name: 'username' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'username',
        'Usernames can only contain letters (A-Z, a-z), numerals (0-9), underscores (_), and hyphens (-). Usernames cannot contain spaces',
      );
    });

    it('should clear error on focus', () => {
      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));

      usernameField.find('input#username').simulate('focus', { target: { value: '', name: 'username' } });
      expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
      expect(props.handleErrorChange).toHaveBeenCalledWith(
        'username',
        '',
      );
    });

    it('should remove space from field on focus if space exists', () => {
      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));

      usernameField.find('input#username').simulate('focus', { target: { value: ' ', name: 'username' } });
      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'username', value: '' } },
      );
    });

    it('should call backend validation api on blur event, if frontend validations have passed', () => {
      store.dispatch = jest.fn(store.dispatch);
      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));

      // Enter a valid username so that frontend validations are passed
      usernameField.find('input#username').simulate('blur', { target: { value: 'test', name: 'username' } });
      expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({ username: 'test' }));
    });

    it('should remove space from the start of username on change', () => {
      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      usernameField.find('input#username').simulate(
        'change', { target: { value: ' test-user', name: 'username' } },
      );

      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'username', value: 'test-user' } },
      );
    });

    it('should not set username if it is more than 30 character long', () => {
      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      usernameField.find('input#username').simulate(
        'change', { target: { value: 'why_this_is_not_valid_username_', name: 'username' } },
      );

      expect(props.handleChange).toHaveBeenCalledTimes(0);
    });

    it('should clear username suggestions when username field is focused in', () => {
      store.dispatch = jest.fn(store.dispatch);

      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      usernameField.find('input#username').simulate('focus');

      expect(store.dispatch).toHaveBeenCalledWith(clearUsernameSuggestions());
    });

    it('should show username suggestions in case of conflict with an existing username', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
        },
      });

      props = {
        ...props,
        errorMessage: 'It looks like this username is already taken',
      };

      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      expect(usernameField.find('button.username-suggestions--chip').length).toEqual(3);
    });

    it('should show username suggestions when they are populated in redux', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
        },
      });

      props = {
        ...props,
        value: ' ',
      };

      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      expect(usernameField.find('button.username-suggestions--chip').length).toEqual(3);
    });

    it('should show username suggestions even if there is an error in field', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
        },
      });

      props = {
        ...props,
        value: ' ',
        errorMessage: 'username error',
      };

      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      expect(usernameField.find('button.username-suggestions--chip').length).toEqual(3);
    });

    it('should put space in username field if suggestions are populated in redux', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
        },
      });

      mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'username', value: ' ' } },
      );
    });

    it('should set suggestion as username by clicking on it', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
        },
      });

      props = {
        ...props,
        value: ' ',
      };

      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      usernameField.find('.username-suggestions--chip').first().simulate('click');
      expect(props.handleChange).toHaveBeenCalledTimes(1);
      expect(props.handleChange).toHaveBeenCalledWith(
        { target: { name: 'username', value: 'test_1' } },
      );
    });

    it('should clear username suggestions when close icon is clicked', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      props = {
        ...props,
        value: ' ',
      };

      let usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      usernameField.find('button.username-suggestions__close__button').at(0).simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(clearUsernameSuggestions());

      props = {
        ...props,
        errorMessage: 'username error',
      };

      usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      usernameField.find('button.username-suggestions__close__button').at(0).simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(clearUsernameSuggestions());
    });

    it('should clear the registration validation error on focus on field', () => {
      store.dispatch = jest.fn(store.dispatch);

      const usernameError = 'It looks like this username is already taken';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            username: [{ userMessage: usernameError }],
          },
        },
      });

      store.dispatch = jest.fn(store.dispatch);
      const usernameField = mount(routerWrapper(reduxWrapper(<IntlUsernameField {...props} />)));
      usernameField.find('input#username').simulate('focus', { target: { value: 'test', name: 'username' } });
      expect(store.dispatch).toHaveBeenCalledWith(clearRegistrationBackendError('username'));
    });
  });
});
