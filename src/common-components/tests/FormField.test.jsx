import React from 'react';
import { Provider } from 'react-redux';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { fetchRealtimeValidations } from '../../register/data/actions';
import FormGroup from '../FormGroup';
import PasswordField from '../PasswordField';

describe('FormGroup', () => {
  const props = {
    floatingLabel: 'Email',
    helpText: ['Email field help text'],
    name: 'email',
    value: '',
    handleFocus: jest.fn(),
  };

  it('should show help text on field focus', () => {
    const formGroup = mount(<FormGroup {...props} />);
    expect(formGroup.find('.pgn-transition-replace-group').find('div#email-1').exists()).toBeFalsy();

    formGroup.find('input#email').simulate('focus');
    expect(formGroup.find('.pgn-transition-replace-group').find('div#email-1').text()).toEqual('Email field help text');
  });
});

describe('PasswordField', () => {
  const mockStore = configureStore();
  const IntlPasswordField = injectIntl(PasswordField);
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </IntlProvider>
  );

  const initialState = {
    register: {
      validationApiRateLimited: false,
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    props = {
      floatingLabel: 'Password',
      name: 'password',
      value: 'password123',
      handleFocus: jest.fn(),
    };
  });

  it('should show/hide password on icon click', () => {
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));

    passwordField.find('button[aria-label="Show password"]').simulate('click');
    expect(passwordField.find('input').prop('type')).toEqual('text');

    passwordField.find('button[aria-label="Hide password"]').simulate('click');
    expect(passwordField.find('input').prop('type')).toEqual('password');
  });

  it('should show password requirement tooltip on focus', async () => {
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));
    jest.useFakeTimers();
    await act(async () => {
      passwordField.find('input').simulate('focus');
      jest.runAllTimers();
    });
    passwordField.update();

    expect(passwordField.find('#password-requirement-left').exists()).toBeTruthy();
  });

  it('should show all password requirement checks as failed', async () => {
    props = {
      ...props,
      value: '',
    };

    jest.useFakeTimers();
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));
    await act(async () => {
      passwordField.find('input').simulate('focus');
      jest.runAllTimers();
    });
    passwordField.update();

    expect(passwordField.find('#letter-check span').prop('className')).toEqual('pgn__icon mr-1 text-light-700');
    expect(passwordField.find('#number-check span').prop('className')).toEqual('pgn__icon mr-1 text-light-700');
    expect(passwordField.find('#characters-check span').prop('className')).toEqual('pgn__icon mr-1 text-light-700');
  });

  it('should update password requirement checks', async () => {
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));
    jest.useFakeTimers();
    await act(async () => {
      passwordField.find('input').simulate('focus');
      jest.runAllTimers();
    });
    passwordField.update();

    expect(passwordField.find('#letter-check span').prop('className')).toEqual('pgn__icon text-success mr-1');
    expect(passwordField.find('#number-check span').prop('className')).toEqual('pgn__icon text-success mr-1');
    expect(passwordField.find('#characters-check span').prop('className')).toEqual('pgn__icon text-success mr-1');
  });

  it('should not run validations when blur is fired on password icon click', () => {
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));

    passwordField.find('button[aria-label="Show password"]').simulate('blur', {
      target: {
        name: 'password',
        value: 'invalid',
      },
      relatedTarget: {
        name: 'passwordIcon',
      },
    });

    expect(passwordField.find('div[feedback-for="password"]').exists()).toBeFalsy();
  });

  it('should call props handle blur if available', () => {
    props = {
      ...props,
      handleBlur: jest.fn(),
    };
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));

    passwordField.find('input#password').simulate('blur', {
      target: {
        name: 'password',
        value: '',
      },
    });

    expect(props.handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should run validations on blur event when rendered from register page', () => {
    props = {
      ...props,
      handleErrorChange: jest.fn(),
    };
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));

    passwordField.find('input#password').simulate('blur', {
      target: {
        name: 'password',
        value: '',
      },
    });

    expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
    expect(props.handleErrorChange).toHaveBeenCalledWith(
      'password',
      'Password criteria has not been met',
    );
  });

  it('should not clear error when focus is fired on password icon click when rendered from register page', () => {
    props = {
      ...props,
      handleErrorChange: jest.fn(),
    };

    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));

    passwordField.find('button[aria-label="Show password"]').simulate('focus', {
      target: {
        name: 'passwordIcon',
        value: '',
      },
    });

    expect(props.handleErrorChange).toHaveBeenCalledTimes(0);
  });

  it('should clear error when focus is fired on password icon click when rendered from register page', () => {
    props = {
      ...props,
      handleErrorChange: jest.fn(),
    };

    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));

    passwordField.find('button[aria-label="Show password"]').simulate('focus', {
      target: {
        name: 'password',
        value: 'invalid',
      },
    });

    expect(props.handleErrorChange).toHaveBeenCalledTimes(1);
    expect(props.handleErrorChange).toHaveBeenCalledWith(
      'password',
      '',
    );
  });

  it('should run backend validations when frontend validations pass on blur when rendered from register page', () => {
    store.dispatch = jest.fn(store.dispatch);
    props = {
      ...props,
      handleErrorChange: jest.fn(),
    };
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));

    passwordField.find('button[aria-label="Show password"]').simulate('blur', {
      target: {
        name: 'password',
        value: 'password123',
      },
    });

    expect(store.dispatch).toHaveBeenCalledWith(fetchRealtimeValidations({ password: 'password123' }));
  });

  it('should use password value from prop when password icon is focused out (blur due to icon)', () => {
    store.dispatch = jest.fn(store.dispatch);
    props = {
      ...props,
      value: 'testPassword',
      handleErrorChange: jest.fn(),
      handleBlur: jest.fn(),
    };
    const passwordField = mount(reduxWrapper(<IntlPasswordField {...props} />));

    passwordField.find('button[aria-label="Show password"]').simulate('blur', {
      target: {
        name: 'passwordIcon',
        value: undefined,
      },
    });

    expect(props.handleBlur).toHaveBeenCalledTimes(1);
    expect(props.handleBlur).toHaveBeenCalledWith({
      target: {
        name: 'password',
        value: 'testPassword',
      },
    });
  });
});
