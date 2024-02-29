import React from 'react';
import { Provider } from 'react-redux';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render } from '@testing-library/react';
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
    const { queryByText, getByLabelText } = render(<FormGroup {...props} />);
    const emailInput = getByLabelText('Email');

    expect(queryByText('Email field help text')).toBeNull();

    fireEvent.focus(emailInput);

    const helpText = queryByText('Email field help text');

    expect(helpText).toBeTruthy();
    expect(helpText.textContent).toEqual('Email field help text');
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
    const { getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));
    const passwordInput = getByLabelText('Password');

    const showPasswordButton = getByLabelText('Show password');
    fireEvent.click(showPasswordButton);
    expect(passwordInput.type).toBe('text');

    const hidePasswordButton = getByLabelText('Hide password');
    fireEvent.click(hidePasswordButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should show password requirement tooltip on focus', async () => {
    const { getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));
    const passwordInput = getByLabelText('Password');
    jest.useFakeTimers();
    await act(async () => {
      fireEvent.focus(passwordInput);
      jest.runAllTimers();
    });
    const passwordRequirementTooltip = document.querySelector('#password-requirement-left');

    expect(passwordRequirementTooltip).toBeTruthy();
  });

  it('should show all password requirement checks as failed', async () => {
    props = {
      ...props,
      value: '',
    };
    const { getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));
    const passwordInput = getByLabelText('Password');
    jest.useFakeTimers();
    await act(async () => {
      fireEvent.focus(passwordInput);
      jest.runAllTimers();
    });

    const letterCheckIcon = document.querySelector('#letter-check span');
    const numberCheckIcon = document.querySelector('#number-check span');
    const charactersCheckIcon = document.querySelector('#characters-check span');

    expect(letterCheckIcon).toBeTruthy();
    expect(letterCheckIcon.className).toContain('pgn__icon mr-1 text-light-700');

    expect(numberCheckIcon).toBeTruthy();
    expect(numberCheckIcon.className).toContain('pgn__icon mr-1 text-light-700');

    expect(charactersCheckIcon).toBeTruthy();
    expect(charactersCheckIcon.className).toContain('pgn__icon mr-1 text-light-700');
  });

  it('should update password requirement checks', async () => {
    const { getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));
    const passwordInput = getByLabelText('Password');
    jest.useFakeTimers();
    await act(async () => {
      fireEvent.focus(passwordInput);
      jest.runAllTimers();
    });

    const letterCheckIcon = document.querySelector('#letter-check span');
    const numberCheckIcon = document.querySelector('#number-check span');
    const charactersCheckIcon = document.querySelector('#characters-check span');

    expect(letterCheckIcon).toBeTruthy();
    expect(letterCheckIcon.className).toContain('pgn__icon text-success mr-1');

    expect(numberCheckIcon).toBeTruthy();
    expect(numberCheckIcon.className).toContain('pgn__icon text-success mr-1');

    expect(charactersCheckIcon).toBeTruthy();
    expect(charactersCheckIcon.className).toContain('pgn__icon text-success mr-1');
  });

  it('should not run validations when blur is fired on password icon click', () => {
    const { container, getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));
    const passwordInput = container.querySelector('input[name="password"]');

    const passwordIcon = getByLabelText('Show password');

    fireEvent.blur(passwordInput, {
      target: {
        name: 'password',
        value: 'invalid',
      },
      relatedTarget: passwordIcon,
    });

    expect(container.querySelector('div[feedback-for="password"]')).toBeNull();
  });

  it('should call props handle blur if available', () => {
    props = {
      ...props,
      handleBlur: jest.fn(),
    };
    const { container } = render(reduxWrapper(<IntlPasswordField {...props} />));
    const passwordInput = container.querySelector('input[name="password"]');

    fireEvent.blur(passwordInput, {
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
    const { container } = render(reduxWrapper(<IntlPasswordField {...props} />));
    const passwordInput = container.querySelector('input[name="password"]');

    fireEvent.blur(passwordInput, {
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

    const { getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));

    const passwordIcon = getByLabelText('Show password');

    fireEvent.focus(passwordIcon, {
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

    const { getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));

    const passwordIcon = getByLabelText('Show password');

    fireEvent.focus(passwordIcon, {
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
    const { getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));
    const passwordField = getByLabelText('Password');
    fireEvent.blur(passwordField, {
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
    const { getByLabelText } = render(reduxWrapper(<IntlPasswordField {...props} />));

    const passwordIcon = getByLabelText('Show password');

    fireEvent.blur(passwordIcon, {
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
