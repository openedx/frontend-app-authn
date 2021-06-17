import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import * as auth from '@edx/frontend-platform/auth';
import { resetPassword } from '../data/actions';
import { APIFailureMessage } from '../../common-components';

import ResetPasswordPage from '../ResetPasswordPage';
import { API_RATELIMIT_ERROR, INTERNAL_SERVER_ERROR } from '../../data/constants';

jest.mock('@edx/frontend-platform/auth');

const IntlResetPasswordPage = injectIntl(ResetPasswordPage);
const mockStore = configureStore();

describe('ResetPasswordPage', () => {
  let props = {};
  let store = {};

  const emptyFieldError = 'Please enter your new password.';
  const validationMessage = 'This password is too short. It must contain at least 8 characters. This password must contain at least 1 number.';

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const submitForm = async (password) => {
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    await act(async () => {
      resetPasswordPage.find('input#reset-password-input').simulate('blur', { target: { value: password } });
    });
    resetPasswordPage.find('input#confirm-password-input').simulate('change', { target: { value: password } });
    resetPasswordPage.find('button.btn-primary').simulate('click');

    return resetPasswordPage;
  };

  beforeEach(() => {
    store = mockStore();
    props = {
      resetPassword: jest.fn(),
      status: null,
      token_status: 'pending',
      token: null,
      errors: null,
      match: {
        params: {},
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should match reset password default section snapshot', () => {
    props = {
      ...props,
      token: 'token',
      token_status: 'valid',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('show spinner component during token validation', () => {
    props = {
      ...props,
      token_status: 'pending',
      match: {
        params: {
          token: 'test-token',
        },
      },
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match invalid token message section snapshot', () => {
    props = {
      ...props,
      token_status: 'invalid',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match pending reset message section snapshot', () => {
    props = {
      ...props,
      token_status: 'valid',
      status: 'pending',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match successful reset message section snapshot', () => {
    props = {
      ...props,
      token_status: 'valid',
      status: 'success',
    };
    const tree = renderer.create(reduxWrapper(<IntlResetPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should display invalid password message', async () => {
    props = {
      ...props,
      token_status: 'valid',
    };

    auth.getHttpClient = jest.fn(() => ({
      post: async () => ({
        data: {
          validation_decisions: {
            password: validationMessage,
          },
        },
        catch: () => {},
      }),
    }));

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));

    // Focus out of empty field
    await act(async () => {
      await resetPasswordPage.find('input#reset-password-input').simulate('blur');
    });
    resetPasswordPage.update();
    expect(resetPasswordPage.find('#reset-password-input-invalid-feedback').text()).toEqual(emptyFieldError);

    // Enter non-compliant password
    await act(async () => {
      await resetPasswordPage.find('input#reset-password-input').simulate('blur', { target: { value: 'invalid' } });
    });
    expect(resetPasswordPage.find('#reset-password-input-invalid-feedback').text()).toEqual(validationMessage);
  });

  it('should display error message on empty form submission', () => {
    const bannerMessage = 'We couldn\'t reset your password.'.concat(emptyFieldError);
    props = {
      ...props,
      token_status: 'valid',
      token: 'token',
    };

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPasswordPage.find('button.btn-primary').simulate('click');

    resetPasswordPage.update();
    expect(resetPasswordPage.find('#reset-password-input-invalid-feedback').text()).toEqual(emptyFieldError);
    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(bannerMessage);
  });

  it('with valid inputs resetPassword action is dispatch', async () => {
    const newPassword = 'test-password1';
    props = {
      ...props,
      token_status: 'valid',
      token: 'token',
    };

    auth.getHttpClient = jest.fn(() => ({
      post: async () => ({
        data: {},
        catch: () => {},
      }),
    }));

    const formPayload = {
      new_password1: newPassword,
      new_password2: newPassword,
    };

    store.dispatch = jest.fn(store.dispatch);

    const resetPasswordPage = await submitForm(newPassword);
    expect(store.dispatch).toHaveBeenCalledWith(resetPassword(formPayload, props.token, {}));
    resetPasswordPage.unmount();
  });

  it('should dispatch resetPassword action if validations have reached rate limit', async () => {
    const password = 'test-password';

    auth.getHttpClient = jest.fn(() => ({
      post: async () => {
        throw new Error('error');
      },
    }));
    store.dispatch = jest.fn(store.dispatch);

    props = {
      ...props,
      token_status: 'valid',
      token: 'token',
    };

    const resetPasswordPage = await submitForm(password);
    expect(store.dispatch).toHaveBeenCalledWith(
      resetPassword({ new_password1: password, new_password2: password }, props.token, {}),
    );

    resetPasswordPage.unmount();
  });

  it('should not update the banner message on focus out', async () => {
    const bannerMessage = 'We couldn\'t reset your password.'.concat(validationMessage);
    props = {
      ...props,
      token_status: 'valid',
      token: 'token',
      errors: validationMessage,
      status: 'failure',
    };

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(bannerMessage);

    await act(async () => {
      await resetPasswordPage.find('input#reset-password-input').simulate('blur', { target: { value: '' } });
    });
    // On blur event, the banner message remains same
    expect(resetPasswordPage.find('#reset-password-input-invalid-feedback').text()).toEqual(emptyFieldError);
    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(bannerMessage);
  });

  it('check cookie rendered', () => {
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find(<CookiePolicyBanner />)).toBeTruthy();
  });

  it('should display error banner on server error', () => {
    const bannerMessage = 'Failed to reset passwordAn error has occurred. Try refreshing the page, or check your internet connection.';
    props = {
      ...props,
      status: 'failure',
      errors: INTERNAL_SERVER_ERROR,
    };

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPasswordPage.find('button.btn-primary').simulate('click');

    resetPasswordPage.update();
    expect(resetPasswordPage.find('#internal-server-error').first().text()).toEqual(bannerMessage);
  });

  it('check api failure banner rendered', () => {
    props = {
      ...props,
      status: 'invalid',
      errors: INTERNAL_SERVER_ERROR,
    };
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find(<APIFailureMessage />)).toBeTruthy();
  });

  it('check failure banner rendered on validate token api ratelimit', () => {
    props = {
      ...props,
      status: 'invalid',
      errors: API_RATELIMIT_ERROR,
    };
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find(<APIFailureMessage />)).toBeTruthy();
  });

  it('check failure banner rendered on reset password api ratelimit', () => {
    props = {
      ...props,
      status: 'failure',
      errors: API_RATELIMIT_ERROR,
    };
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find(<APIFailureMessage />)).toBeTruthy();
  });
});
