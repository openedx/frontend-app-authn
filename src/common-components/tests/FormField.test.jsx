import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';

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
  const IntlPasswordField = injectIntl(PasswordField);
  let props = {};

  beforeEach(() => {
    props = {
      floatingLabel: 'Password',
      name: 'password',
      value: 'password123',
      handleFocus: jest.fn(),
    };
  });

  it('should show/hide password on icon click', () => {
    const passwordField = mount(<IntlProvider locale="en"><IntlPasswordField {...props} /></IntlProvider>);

    passwordField.find('button[aria-label="Show password"]').simulate('click');
    expect(passwordField.find('input').prop('type')).toEqual('text');

    passwordField.find('button[aria-label="Hide password"]').simulate('click');
    expect(passwordField.find('input').prop('type')).toEqual('password');
  });

  it('should show password requirement tooltip on focus', async () => {
    const passwordField = mount(<IntlProvider locale="en"><IntlPasswordField {...props} /></IntlProvider>);
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
    const passwordField = mount(<IntlProvider locale="en"><IntlPasswordField {...props} /></IntlProvider>);
    await act(async () => {
      passwordField.find('input').simulate('focus');
      jest.runAllTimers();
    });
    passwordField.update();

    expect(passwordField.find('#letter-check span').prop('className')).toEqual('pgn__icon mr-1');
    expect(passwordField.find('#number-check span').prop('className')).toEqual('pgn__icon mr-1');
    expect(passwordField.find('#characters-check span').prop('className')).toEqual('pgn__icon mr-1');
  });

  it('should update password requirement checks', async () => {
    const passwordField = mount(<IntlProvider locale="en"><IntlPasswordField {...props} /></IntlProvider>);
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
});
