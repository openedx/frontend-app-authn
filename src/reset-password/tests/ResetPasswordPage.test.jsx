import React from 'react';

import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import * as auth from '@edx/frontend-platform/auth';
import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';

import { resetPassword } from '../data/actions';
import { PASSWORD_RESET, TOKEN_STATE } from '../data/constants';
import ResetPasswordPage from '../ResetPasswordPage';

jest.mock('@edx/frontend-platform/auth');

const IntlResetPasswordPage = injectIntl(ResetPasswordPage);
const mockStore = configureStore();

describe('ResetPasswordPage', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </IntlProvider>
  );

  const submitForm = (password) => {
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPasswordPage.find('input#newPassword').simulate('change', { target: { value: password, name: 'newPassword' } });
    resetPasswordPage.find('input#confirmPassword').simulate('change', { target: { value: password, name: 'confirmPassword' } });
    resetPasswordPage.find('button.btn-brand').simulate('click');

    return resetPasswordPage;
  };

  beforeEach(() => {
    store = mockStore();
    props = {
      resetPassword: jest.fn(),
      status: null,
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

  // ******** form submission tests ********

  it('with valid inputs resetPassword action is dispatched', async () => {
    const password = 'test-password-1';

    store = mockStore({
      resetPassword: {
        status: TOKEN_STATE.VALID,
      },
    });

    auth.getHttpClient = jest.fn(() => ({
      post: async () => ({
        data: {},
        catch: () => {},
      }),
    }));

    store.dispatch = jest.fn(store.dispatch);
    const resetPasswordPage = submitForm(password);

    expect(store.dispatch).toHaveBeenCalledWith(resetPassword(
      { new_password1: password, new_password2: password }, props.token, {},
    ));
    resetPasswordPage.unmount();
  });

  // ******** test reset password field validations ********

  it('should show error messages for required fields on empty form submission', () => {
    store = mockStore({
      resetPassword: {
        status: TOKEN_STATE.VALID,
      },
    });
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPasswordPage.find('button.btn-brand').simulate('click');

    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(
      'We couldn\'t reset your password.Please check your responses and try again.',
    );
    expect(resetPasswordPage.find('div[feedback-for="newPassword"]').text()).toEqual('Password criteria has not been met');
    expect(resetPasswordPage.find('div[feedback-for="confirmPassword"]').text()).toEqual('Confirm your password');
  });

  it('should show error message when new and confirm password do not match', () => {
    store = mockStore({
      resetPassword: {
        status: TOKEN_STATE.VALID,
      },
    });
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPasswordPage.find('input#confirmPassword').simulate(
      'change', { target: { value: 'password-mismatch', name: 'confirmPassword' } },
    );
    expect(resetPasswordPage.find('div[feedback-for="confirmPassword"]').text()).toEqual('Passwords do not match');
  });

  // ******** alert message tests ********

  it('should show reset password rate limit error', () => {
    store = mockStore({
      resetPassword: {
        status: PASSWORD_RESET.FORBIDDEN_REQUEST,
      },
    });

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(
      'Too many requests.An error has occurred because of too many requests. Please try again after some time.',
    );
  });

  it('should show reset password internal server error', () => {
    store = mockStore({
      resetPassword: {
        status: PASSWORD_RESET.INTERNAL_SERVER_ERROR,
      },
    });

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(
      'We couldn\'t reset your password.An error has occurred. Try refreshing the page, or check your internet connection.',
    );
  });

  // ******** miscellaneous tests ********

  it('check cookie rendered', () => {
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find(<CookiePolicyBanner />)).toBeTruthy();
  });

  it('show spinner during token validation', () => {
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find('div.spinner-header')).toBeTruthy();
  });
});
